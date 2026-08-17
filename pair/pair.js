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
 *
 * Sprache: Deutsch + Englisch, Auto-Erkennung ueber navigator.language,
 * Auswahl in localStorage. Echte Umlaute sind hier unbedenklich, weil GitHub
 * Pages die Datei mit "charset=utf-8" ausliefert (geprueft 2026-08-17).
 */
(function () {
  "use strict";

  var PBKDF2_ITERATIONS = 200000; // bewusst teuer gegen Raten des Schluesselteils
  var PLACEHOLDER_URL = "https://pairing.invalid/verschluesselt";
  var LANG_KEY = "selfstore_pair_lang";

  var I18N = {
    de: {
      htmlLang: "de",
      title: "SelfStore – Quelle koppeln",
      h1_suffix: "Quelle koppeln",
      lead_1: "Gib den ",
      lead_code: "Code",
      lead_2: " ein, der auf deinem Fernseher angezeigt wird, dazu den ",
      lead_link: "Link",
      lead_3: " und das ",
      lead_pw: "Passwort",
      lead_4: ", die du bekommen hast. SelfStore auf dem TV übernimmt die Quelle dann automatisch – kein Tippen auf der Fernbedienung.",
      label_code: "Code vom Fernseher",
      ph_code: "z. B. 7K2Q9XAB-4H7PNM",
      hint_code: "Kompletter Code inklusive Bindestrich. Der Teil hinter dem Bindestrich ist der Schlüssel und wird nicht an den Server geschickt.",
      label_link: "Link",
      ph_link: "https://…/s/…  oder  …/catalog.json",
      label_user: "Benutzername",
      hint_user: "Nur nötig bei direkter WebDAV-Adresse. Bei einem NextCloud-Freigabe-Link leer lassen – der Benutzername wird automatisch erkannt.",
      ph_user: "bei Freigabe-Link (…/s/…) automatisch",
      label_pw: "Passwort",
      ph_pw: "Link-/App-Passwort",
      label_name: "Name (optional)",
      ph_name: "z. B. Meine NextCloud",
      send: "An den Fernseher senden",
      foot: "Link und Passwort werden hier im Browser verschlüsselt. Der Pairing-Dienst speichert nur den Geheimtext, höchstens 3 Minuten, und löscht ihn beim Abruf.",
      err_code: "Bitte den vollständigen Code vom Fernseher eingeben (z. B. 7K2Q9XAB-4H7PNM).",
      err_link: "Der Link muss mit https:// beginnen.",
      err_pw: "Bitte das Passwort eingeben.",
      err_cfg: "Dienst noch nicht konfiguriert. Bitte später erneut versuchen.",
      err_crypto: "Dieser Browser kann die Daten nicht verschlüsseln. Bitte einen aktuellen Browser über HTTPS nutzen.",
      err_user: "Bitte einen Benutzernamen eingeben (bei einem Freigabe-Link …/s/… wird er automatisch erkannt).",
      err_send: "Senden fehlgeschlagen. Code korrekt? Sonst neu starten.",
      err_net: "Keine Verbindung zum Dienst. Internet prüfen und erneut versuchen.",
      ok: "Gesendet! Auf dem Fernseher erscheint die Quelle gleich automatisch.",
    },
    en: {
      htmlLang: "en",
      title: "SelfStore – pair a source",
      h1_suffix: "Pair a source",
      lead_1: "Enter the ",
      lead_code: "code",
      lead_2: " shown on your TV, along with the ",
      lead_link: "link",
      lead_3: " and the ",
      lead_pw: "password",
      lead_4: " you were given. SelfStore on the TV then picks up the source automatically – no typing on the remote.",
      label_code: "Code from the TV",
      ph_code: "e.g. 7K2Q9XAB-4H7PNM",
      hint_code: "The complete code including the hyphen. The part after the hyphen is the key and is never sent to the server.",
      label_link: "Link",
      ph_link: "https://…/s/…  or  …/catalog.json",
      label_user: "Username",
      hint_user: "Only needed for a direct WebDAV address. With a NextCloud share link, leave it empty – the username is detected automatically.",
      ph_user: "automatic with a share link (…/s/…)",
      label_pw: "Password",
      ph_pw: "Link / app password",
      label_name: "Name (optional)",
      ph_name: "e.g. My NextCloud",
      send: "Send to the TV",
      foot: "Link and password are encrypted here in your browser. The pairing service only ever stores the ciphertext, for 3 minutes at most, and deletes it on pickup.",
      err_code: "Please enter the complete code from the TV (e.g. 7K2Q9XAB-4H7PNM).",
      err_link: "The link must start with https://.",
      err_pw: "Please enter the password.",
      err_cfg: "Service not configured yet. Please try again later.",
      err_crypto: "This browser cannot encrypt the data. Please use an up-to-date browser over HTTPS.",
      err_user: "Please enter a username (with a share link …/s/… it is detected automatically).",
      err_send: "Sending failed. Is the code correct? Otherwise start over.",
      err_net: "No connection to the service. Check your internet and try again.",
      ok: "Sent! The source will appear on the TV in a moment.",
    },
  };

  var $ = function (id) { return document.getElementById(id); };

  function pickLang() {
    var saved = "";
    try { saved = localStorage.getItem(LANG_KEY) || ""; } catch (e) { /* Privatmodus */ }
    if (I18N[saved]) return saved;
    var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return I18N[nav] ? nav : "en";
  }

  var lang = pickLang();

  function t(key) { return (I18N[lang] || I18N.en)[key]; }

  function applyLang() {
    var d = I18N[lang] || I18N.en;
    document.documentElement.lang = d.htmlLang;
    document.title = d.title;
    // Textinhalte: ausschliesslich textContent (kein innerHTML) - die Seite
    // bleibt damit auch bei kuenftigen Textaenderungen XSS-frei.
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (d[k] != null) el.textContent = d[k];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      if (d[k] != null) el.placeholder = d[k];
    });
    var sel = $("lang-select");
    if (sel) sel.value = lang;
  }

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

  function show(kind, key) {
    var m = $("msg");
    m.className = "msg " + kind;
    m.textContent = t(key);
  }

  applyLang();

  var sel = $("lang-select");
  if (sel) {
    sel.addEventListener("change", function () {
      if (!I18N[sel.value]) return;
      lang = sel.value;
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* Privatmodus */ }
      applyLang();
    });
  }

  $("send").addEventListener("click", async function () {
    var parts = splitCode($("code").value);
    var rawLink = $("link").value.trim();
    var manualUser = $("user").value.trim();
    var pw = $("pw").value;
    var name = $("name").value.trim();

    if (!parts) return show("err", "err_code");
    if (!rawLink.startsWith("https://")) return show("err", "err_link");
    if (!pw) return show("err", "err_pw");
    if (!ENDPOINT) return show("err", "err_cfg");
    if (!window.crypto || !crypto.subtle) return show("err", "err_crypto");

    var share = parseShare(rawLink);
    var url = share ? share.url : rawLink;
    // Bei Freigabe-Link gewinnt der Token; sonst der manuell eingegebene Benutzername.
    var user = share ? share.user : manualUser;
    if (!user) return show("err", "err_user");

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
        show("ok", "ok");
      } else {
        show("err", "err_send");
        $("send").disabled = false;
      }
    } catch (e) {
      show("err", "err_net");
      $("send").disabled = false;
    }
  });
})();
