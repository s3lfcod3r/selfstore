/**
 * SelfStore – Pairing-Briefkasten (Cloudflare Worker)
 *
 * Zweck: Eine Quelle (Link + Passwort) vom Browser an die TV-Box übergeben,
 * ohne auf dem Fernseher zu tippen. Ablauf:
 *   1. SelfStore zeigt SLOT-SCHLUESSEL (z. B. 7K2Q9XAB-4H7PNM) und pollt
 *      GET /pair/<SLOT>. Nur der SLOT geht an diesen Dienst.
 *   2. Browser verschlüsselt { url, user, pw, label } mit einem Schlüssel, der
 *      aus dem zweiten Code-Teil abgeleitet wird, und schickt POST /pair { code, enc }
 *   3. SelfStore holt den Geheimtext ab (wird dabei SOFORT gelöscht) und
 *      entschlüsselt ihn lokal.
 *
 * Sicherheit: Dieser Dienst sieht nur Geheimtext — Link und Passwort kann er
 * nicht lesen, weil der Schlüsselteil ihn nie erreicht. Zusätzlich: CORS nur
 * für die eigene Domain; POST und GET pro IP rate-limitiert; Daten max. TTL
 * Sekunden im KV und bei Abholung gelöscht.
 *
 * ⚠️ Kompatibilität: Web-Pairing setzt SelfStore ab v1.5.0 voraus. Ältere
 * Installationen verstehen das verschlüsselte Format nicht — dort die Quelle
 * direkt am Fernseher eintippen oder zuerst SelfStore aktualisieren.
 *
 * Einrichtung: KV-Namespace als Binding "PAIR" an diesen Worker binden.
 */

const TTL = 180;          // Lebensdauer eines Slots (Sekunden)
const POST_RL_MAX = 20;   // erlaubte POSTs pro IP und Minute (gegen Brute-Force)
const GET_RL_MAX = 120;   // erlaubte GETs pro IP und Minute – klar ueber der Poll-Rate
                          // (Box pollt 20/min); haelt auch bei geteilter CGNAT-IP (Vodafone).

const ALLOWED_ORIGINS = [
  "https://store.selfcoder.de",
  "https://s3lfcod3r.github.io",
];

function cors(req) {
  const origin = req.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(obj, status, req) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors(req) },
  });
}

export default {
  async fetch(req, env) {
    if (!env.PAIR) return json({ error: "kv_not_configured" }, 503, req);

    const url = new URL(req.url);
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });

    // Browser legt Daten ab (rate-limitiert pro IP gegen Brute-Force).
    if (req.method === "POST" && url.pathname === "/pair") {
      const ip = req.headers.get("CF-Connecting-IP") || "unknown";
      const rlKey = "rl:" + ip;
      const n = parseInt((await env.PAIR.get(rlKey)) || "0", 10);
      if (n >= POST_RL_MAX) return json({ error: "rate_limited" }, 429, req);
      await env.PAIR.put(rlKey, String(n + 1), { expirationTtl: 60 });

      let body;
      try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400, req); }
      const code = String(body.code || "").trim().toUpperCase();
      if (!/^[A-Z0-9]{6,10}$/.test(code)) return json({ error: "bad_code" }, 400, req);

      // Nur noch Ende-zu-Ende verschluesselte Beitraege: "enc" ist
      // Base64(iv || AES-GCM-Geheimtext). Der Schluessel wird aus dem zweiten
      // Teil des Codes abgeleitet, der ausschliesslich zwischen Fernseher und
      // Browser laeuft — dieser Dienst kann Link/Benutzer/Passwort daher nicht
      // lesen. Klartext-Beitraege werden bewusst NICHT mehr angenommen.
      const enc = String(body.enc || "");
      if (!enc) return json({ error: "encryption_required" }, 400, req);
      if (!/^[A-Za-z0-9+/=]{24,4096}$/.test(enc)) return json({ error: "bad_enc" }, 400, req);

      const payload = JSON.stringify({ enc });
      await env.PAIR.put("c:" + code, payload, { expirationTtl: TTL });
      return json({ ok: true }, 200, req);
    }

    // TV holt Daten ab (einmalig, danach gelöscht). Rate-limitiert pro IP.
    const m = url.pathname.match(/^\/pair\/([A-Z0-9]{6,10})$/);
    if (req.method === "GET" && m) {
      const ip = req.headers.get("CF-Connecting-IP") || "unknown";
      const rlKey = "rl-get:" + ip;
      const n = parseInt((await env.PAIR.get(rlKey)) || "0", 10);
      if (n >= GET_RL_MAX) return json({ error: "rate_limited" }, 429, req);
      await env.PAIR.put(rlKey, String(n + 1), { expirationTtl: 60 });

      const code = m[1];
      const val = await env.PAIR.get("c:" + code);
      // Noch nichts abgelegt -> einfach weiter warten. Den Slot NICHT löschen!
      // Der frühere Fehlversuch-Zähler (MAX_MISSES) konnte durch die KV-Konsistenz-
      // Verzögerung zwischen Cloudflare-Rechenzentren die gerade erst abgelegte Quelle
      // löschen, bevor der TV sie sah -> "erreichbar, aber es kommt nichts an", vor allem
      // wenn Browser und TV in verschiedenen Haushalten/Regionen sind. Schutz gegen
      // Erraten bleibt: Codespace 32^8, TTL 180s und das IP-Rate-Limit.
      if (!val) return json({ pending: true }, 200, req);
      // Erfolgreicher Abruf: einmalig ausliefern und löschen.
      await env.PAIR.delete("c:" + code);
      return new Response(val, {
        headers: { "Content-Type": "application/json", ...cors(req) },
      });
    }

    return json({ error: "not_found" }, 404, req);
  },
};
