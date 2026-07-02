/**
 * SelfStore – Pairing-Briefkasten (Cloudflare Worker)
 *
 * Zweck: Eine Quelle (Link + Passwort) vom Browser an die TV-Box übergeben,
 * ohne auf dem Fernseher zu tippen. Ablauf:
 *   1. SelfStore zeigt einen CODE (8 Zeichen, SecureRandom) und pollt GET /pair/<CODE>
 *   2. Browser-Formular schickt POST /pair { code, url, user, pw, label }
 *   3. SelfStore holt die Daten ab → werden dabei SOFORT gelöscht (einmalig)
 *
 * Sicherheit: CORS nur für die eigene Domain; POST und GET sind pro IP
 * rate-limitiert; Daten max. TTL Sekunden im KV, bei Abholung gelöscht.
 * Zusätzlich wird ein Code nach wenigen Fehlversuchen invalidiert
 * (Schutz gegen Brute-Force des Codes).
 *
 * Einrichtung: KV-Namespace als Binding "PAIR" an diesen Worker binden.
 */

const TTL = 180;          // Lebensdauer eines Slots (Sekunden)
const POST_RL_MAX = 20;   // erlaubte POSTs pro IP und Minute (gegen Brute-Force)
const GET_RL_MAX = 30;    // erlaubte GETs pro IP und Minute (gegen Brute-Force)
const MAX_MISSES = 5;     // Fehlversuche pro Code, danach wird der Code invalidiert

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
      if (!body.url || !body.pw) return json({ error: "missing_fields" }, 400, req);
      if (!String(body.url).startsWith("https://")) return json({ error: "bad_url" }, 400, req);

      const payload = JSON.stringify({
        url: String(body.url).slice(0, 512),
        user: String(body.user || "").slice(0, 256),
        pw: String(body.pw).slice(0, 256),
        label: String(body.label || "").slice(0, 128),
      });
      await env.PAIR.put("c:" + code, payload, { expirationTtl: TTL });
      return json({ ok: true }, 200, req);
    }

    // TV holt Daten ab (einmalig, danach gelöscht).
    // Rate-limitiert pro IP + Fehlversuch-Zähler pro Code gegen Brute-Force.
    const m = url.pathname.match(/^\/pair\/([A-Z0-9]{6,10})$/);
    if (req.method === "GET" && m) {
      const ip = req.headers.get("CF-Connecting-IP") || "unknown";
      const rlKey = "rl-get:" + ip;
      const n = parseInt((await env.PAIR.get(rlKey)) || "0", 10);
      if (n >= GET_RL_MAX) return json({ error: "rate_limited" }, 429, req);
      await env.PAIR.put(rlKey, String(n + 1), { expirationTtl: 60 });

      const code = m[1];
      const val = await env.PAIR.get("c:" + code);
      if (!val) {
        // Fehlversuch zählen; nach MAX_MISSES den Slot invalidieren (falls noch vorhanden).
        const missKey = "miss:" + code;
        const misses = parseInt((await env.PAIR.get(missKey)) || "0", 10) + 1;
        if (misses >= MAX_MISSES) {
          await env.PAIR.delete("c:" + code);
          await env.PAIR.delete(missKey);
        } else {
          await env.PAIR.put(missKey, String(misses), { expirationTtl: TTL });
        }
        return json({ pending: true }, 200, req);
      }
      // Erfolgreicher Abruf: Daten und Fehlversuch-Zähler löschen (einmalig).
      await env.PAIR.delete("c:" + code);
      await env.PAIR.delete("miss:" + code);
      return new Response(val, {
        headers: { "Content-Type": "application/json", ...cors(req) },
      });
    }

    return json({ error: "not_found" }, 404, req);
  },
};
