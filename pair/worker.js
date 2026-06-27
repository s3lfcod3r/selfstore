/**
 * SelfStore – Pairing-Briefkasten (Cloudflare Worker)
 *
 * Zweck: Eine Quelle (Link + Passwort) vom Browser an die TV-Box übergeben,
 * ohne auf dem Fernseher zu tippen. Ablauf:
 *   1. SelfStore zeigt einen kurzen CODE und pollt  GET /pair/<CODE>
 *   2. Browser-Formular schickt POST /pair { code, url, user, pw, label }
 *   3. SelfStore holt die Daten ab → werden dabei SOFORT gelöscht (einmalig)
 *
 * Daten liegen max. TTL Sekunden im KV und werden bei Abholung gelöscht.
 *
 * Einrichtung: KV-Namespace anlegen und als Binding "PAIR" an diesen Worker
 * binden (siehe docs/WEB-KOPPLUNG-SETUP.md).
 */

const TTL = 600; // 10 Minuten Lebensdauer

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    // Browser legt Daten ab.
    if (req.method === "POST" && url.pathname === "/pair") {
      let body;
      try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400); }
      const code = String(body.code || "").trim().toUpperCase();
      if (!/^[A-Z0-9]{6,8}$/.test(code)) return json({ error: "bad_code" }, 400);
      if (!body.url || !body.pw) return json({ error: "missing_fields" }, 400);
      const payload = JSON.stringify({
        url: String(body.url).slice(0, 512),
        user: String(body.user || "").slice(0, 256),
        pw: String(body.pw).slice(0, 256),
        label: String(body.label || "").slice(0, 128),
      });
      await env.PAIR.put("c:" + code, payload, { expirationTtl: TTL });
      return json({ ok: true });
    }

    // TV holt Daten ab (einmalig, danach gelöscht).
    const m = url.pathname.match(/^\/pair\/([A-Za-z0-9]{6,8})$/);
    if (req.method === "GET" && m) {
      const code = m[1].toUpperCase();
      const val = await env.PAIR.get("c:" + code);
      if (!val) return json({ pending: true });
      await env.PAIR.delete("c:" + code);
      return new Response(val, {
        headers: { "Content-Type": "application/json", ...CORS },
      });
    }

    return json({ error: "not_found" }, 404);
  },
};
