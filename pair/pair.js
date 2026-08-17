/**
 * SelfStore – Pairing-Formular (ausgelagert, damit die Seite ohne
 * 'unsafe-inline' im script-src auskommt).
 *
 * Vertraulichkeit: Link, Benutzername und Passwort werden HIER im Browser
 * verschlüsselt (AES-GCM) und verlassen das Gerät nur als Geheimtext. Der
 * Schlüssel wird aus dem zweiten Teil des Codes abgeleitet, der NIE an den
 * Server geht — der Pairing-Dienst (Cloudflare) sieht also nie das Passwort.
 *   Code auf dem Fernseher:  ABCD2345-6HJKLM
 *                            ^Slot     ^Schluessel (bleibt lokal)
 */
(function () {
  "use strict";

  var PBKDF2_ITERATIONS = 200000; // bewusst teuer gegen Raten des Schluesselteils
  var PLACEHOLDER_URL = "https://pairing.invalid/verschluesselt";

  // Worker-Adresse kommt aus der catalog.json (Feld "pairEndpoint") – eine
  // einzige Stelle zum Konfigurieren für App UND Webseite.
  // Hinweis: Der Host steht zusätzlich in der CSP (connect-src) — ändert er
  // sich, muss er in pair/index.html mitgeändert werden.
  var ENDPOINT = null;
  fetch("/catalog.json", { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      var ep = j && j.pairEndpoint;
      if (typeof ep === "string" && /^https:\/\/.+/.test(ep)) ENDPOINT = ep.replace(/\/+$/, "");
    })
    .catch(function (e) { console.error("[SelfStore] catalog.json nicht ladbar:", e); });

  // NextCloud-Freigabe-Link erkennen → WebDAV-Adresse + Token ableiten.
  function parseShare(input) {
    var m = input.trim().match(/^https:\/\/([^/]+)\/(?:index\.php\/)?s\/([A-Za-z0-9._-]+)\/?$/);
    if (!m) return null;
    return { url: "https://" + m[1] + "/public.php/webdav/catalog.json", user: m[2] };
  }

  /** Trennt die Eingabe in Slot-Code (an den Server) und Schlüsselteil (bleibt hier). */
  function splitCode(raw) {
    var cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
    var m = cleaned.match(/^([A-Z0-9]{6,10})-([A-Z0-9]{4,12})$/);
    if (!m) return null;
    return { slot: m[1], secret: m[2] };
  }

  function toBase64(bytes) {
    var s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }

  /** AES-GCM-Geheimtext als Base64(iv || ciphertext). */
  async function encryptPayload(slot, secret, payload) {
    var enc = new TextEncoder();
    var base = await crypto.subtle.importKey("raw", enc.encode(secret), "PBKDF2", false, ["deriveKey"]);
    var key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: enc.encode(slot), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, enc.encode(JSON.stringify(payload)));
    var out = new Uint8Array(iv.length + ct.byteLength);
    out.set(iv, 0);
    out.set(new Uint8Array(ct), iv.length);
    return toBase64(out);
  }

  var $ = function (id) { return document.getElementById(id); };
  function show(kind, text) {
    var m = $("msg");
    m.className = "msg " + kind;
    m.textContent = text;
  }

  $("send").addEventListener("click", async function () {
    var parts = splitCode($("code").value);
    var rawLink = $("link").value.trim();
    var manualUser = $("user").value.trim();
    var pw = $("pw").value;
    var name = $("name").value.trim();

    if (!parts) return show("err", "Bitte den vollständigen Code vom Fernseher eingeben (z. B. 7K2Q9XAB-4H7PNM).");
    if (!rawLink.startsWith("https://")) return show("err", "Der Link muss mit https:// beginnen.");
    if (!pw) return show("err", "Bitte das Passwort eingeben.");
    if (!ENDPOINT) return show("err", "Dienst noch nicht konfiguriert. Bitte später erneut versuchen.");
    if (!window.crypto || !crypto.subtle) {
      return show("err", "Dieser Browser kann die Daten nicht verschlüsseln. Bitte einen aktuellen Browser über HTTPS nutzen.");
    }

    var share = parseShare(rawLink);
    var url = share ? share.url : rawLink;
    // Bei Freigabe-Link gewinnt der Token; sonst der manuell eingegebene Benutzername.
    var user = share ? share.user : manualUser;
    if (!user) return show("err", "Bitte einen Benutzernamen eingeben (bei einem Freigabe-Link …/s/… wird er automatisch erkannt).");

    $("send").disabled = true;
    try {
      var enc = await encryptPayload(parts.slot, parts.secret, {
        url: url, user: user, pw: pw, label: name,
      });
      var res = await fetch(ENDPOINT + "/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // url/pw sind reine Platzhalter: ein noch nicht aktualisierter
        // Pairing-Dienst wuerde den Beitrag sonst als unvollstaendig ablehnen.
        // Die echten Daten stecken ausschliesslich in "enc".
        body: JSON.stringify({ code: parts.slot, enc: enc, url: PLACEHOLDER_URL, user: "-", pw: "-", label: "" }),
      });
      if (res.ok) {
        show("ok", "Gesendet! Auf dem Fernseher erscheint die Quelle gleich automatisch.");
      } else {
        show("err", "Senden fehlgeschlagen. Code korrekt? Sonst neu starten.");
        $("send").disabled = false;
      }
    } catch (e) {
      show("err", "Keine Verbindung zum Dienst. Internet prüfen und erneut versuchen.");
      $("send").disabled = false;
    }
  });
})();
