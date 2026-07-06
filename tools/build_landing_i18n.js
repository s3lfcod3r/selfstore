"use strict";
const fs = require("fs");
const path = require("path");

const REPO = path.join(__dirname, "..");
const DATA = require(path.join(__dirname, "i18n-data.json"));

// Anzeige-Reihenfolge im Sprachwaehler; label = nativer Sprachname.
const LANGS = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "pt", label: "Português" },
  { code: "sv", label: "Svenska" },
  { code: "da", label: "Dansk" },
  { code: "cs", label: "Čeština" },
  { code: "el", label: "Ελληνικά" },
];
// Sprachen mit uebersetzten App-Texten (Basis-Feld selbst = Deutsch).
const APP_LANGS = ["en", "fr", "es", "it", "nl", "pl", "pt", "sv", "da", "cs", "el"];

// --- I18N-Objekt fuer app.js zusammenbauen (htmlLang ergaenzen) ---
const I18N = {};
for (const { code } of LANGS) {
  const ui = DATA.ui[code];
  if (!ui) throw new Error("UI fehlt: " + code);
  I18N[code] = Object.assign({ htmlLang: code }, ui);
}

// Jedes Zeichen > 127 in \uXXXX escapen -> app.js bleibt reines ASCII (charset-sicher).
function asciiLiteral(obj, indent) {
  return JSON.stringify(obj, null, indent).replace(/[\s\S]/g, function (c) {
    const code = c.charCodeAt(0);
    return code > 127 ? "\\u" + code.toString(16).padStart(4, "0") : c;
  });
}

const APP_JS = `// SelfStore Landing - 12 Sprachen (i18n) + XSS-sicheres Katalog-Rendering
// (textContent, nur HTTPS-Links). i18n-Strings sind hartkodierte Konstanten
// (kein User-Input), daher ist innerHTML fuer die [data-i18n-html]-Elemente
// unbedenklich. Generiert aus tools/i18n-data.json.
(function () {
  "use strict";

  var SELF_APK = "https://store.selfcoder.de/selfstore.apk";

  // Reihenfolge = Anzeige im Sprachwaehler. label = nativer Sprachname.
  var LANGS = ${asciiLiteral(LANGS, 0)};
  var CODES = LANGS.map(function (l) { return l.code; });

  var I18N = ${asciiLiteral(I18N, 4).replace(/\n/g, "\n  ")};

  var STORE = { cat: null, lang: "de" };

  function t(lang) {
    return I18N[lang] || I18N.de;
  }

  function detectLang() {
    try {
      var s = localStorage.getItem("selfstore-lang");
      if (CODES.indexOf(s) >= 0) return s;
    } catch (e) {}
    var n = (navigator.language || "en").toLowerCase().slice(0, 2);
    return CODES.indexOf(n) >= 0 ? n : "en";
  }

  function httpsOnly(u) {
    return typeof u === "string" && /^https:\\/\\//i.test(u) ? u : "#";
  }
  function allowedIcon(u) {
    return typeof u === "string" && (/^https:\\/\\//i.test(u) || /^icons\\//.test(u));
  }

  // Uebersetzte App-Felder: Basis-Feld = Deutsch; sonst i18n[lang] -> i18n.en -> Basis.
  function field(a, base, lang) {
    if (lang !== "de" && a.i18n) {
      var m = a.i18n[lang];
      if (m && m[base]) return m[base];
      var en = a.i18n.en;
      if (en && en[base]) return en[base];
    }
    return a[base] || "";
  }

  function buildPicker() {
    var sel = document.getElementById("lang-select");
    if (!sel) return;
    LANGS.forEach(function (l) {
      var o = document.createElement("option");
      o.value = l.code;
      o.textContent = l.label;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      setLang(sel.value);
    });
  }

  function applyStatic(lang) {
    var d = t(lang);
    document.documentElement.lang = d.htmlLang;
    document.title = d.title;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (d[k] != null) el.textContent = d[k];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-html");
      if (d[k] != null) el.innerHTML = d[k];
    });
    var su = document.getElementById("self-url");
    if (su) su.textContent = SELF_APK;
    var upd = document.getElementById("updated");
    if (upd && STORE.cat) upd.textContent = d.updated_prefix + " " + (STORE.cat.updated || "");
    var sel = document.getElementById("lang-select");
    if (sel) sel.value = lang;
  }

  function renderApps(lang) {
    var cat = STORE.cat;
    if (!cat) return;
    var host = document.getElementById("apps");
    host.textContent = "";
    (cat.apps || []).forEach(function (a) {
      var apk = httpsOnly(a.apk || (a.abis && (a.abis["arm64-v8a"] || a.abis["armeabi-v7a"])));

      var card = document.createElement("div");
      card.className = "app";

      var img = document.createElement("img");
      img.alt = "";
      if (allowedIcon(a.icon)) img.src = a.icon;
      img.addEventListener("error", function () {
        img.style.visibility = "hidden";
      });

      var meta = document.createElement("div");
      meta.className = "meta";

      var name = document.createElement("div");
      name.className = "name";
      name.textContent = a.name || a.id || "";

      var tl = document.createElement("div");
      tl.className = "tl";
      tl.textContent = field(a, "tagline", lang);

      var desc = document.createElement("div");
      desc.className = "desc";
      desc.textContent = field(a, "description", lang);

      var ver = document.createElement("div");
      ver.className = "ver";
      ver.textContent = "v" + (a.versionName || "?") + " \\u00b7 " + field(a, "category", lang);

      meta.appendChild(name);
      meta.appendChild(tl);
      meta.appendChild(desc);
      meta.appendChild(ver);

      var link = document.createElement("a");
      link.className = "btn ghost";
      link.textContent = "APK";
      link.href = apk;

      card.appendChild(img);
      card.appendChild(meta);
      card.appendChild(link);
      host.appendChild(card);
    });
  }

  function showError(lang) {
    var host = document.getElementById("apps");
    if (!host) return;
    host.textContent = "";
    var d = document.createElement("div");
    d.className = "card";
    d.textContent = t(lang).apps_error;
    host.appendChild(d);
  }

  function setLang(lang) {
    STORE.lang = lang;
    try {
      localStorage.setItem("selfstore-lang", lang);
    } catch (e) {}
    applyStatic(lang);
    if (STORE.cat) renderApps(lang);
  }

  // --- Init ---
  var dl = document.getElementById("dl-self");
  if (dl) dl.href = SELF_APK;

  buildPicker();
  STORE.lang = detectLang();
  applyStatic(STORE.lang);

  fetch("catalog.json", { cache: "no-cache" })
    .then(function (r) {
      return r.json();
    })
    .then(function (cat) {
      STORE.cat = cat;
      applyStatic(STORE.lang);
      renderApps(STORE.lang);
    })
    .catch(function () {
      showError(STORE.lang);
    });
})();
`;

fs.writeFileSync(path.join(REPO, "app.js"), APP_JS, "utf8");
console.log("app.js geschrieben (" + APP_JS.length + " Bytes)");

// --- catalog.json patchen: *En raus, i18n rein ---
const catPath = path.join(REPO, "catalog.json");
const cat = JSON.parse(fs.readFileSync(catPath, "utf8"));
let patched = 0;
for (const app of cat.apps || []) {
  delete app.taglineEn;
  delete app.descriptionEn;
  delete app.categoryEn;
  const i18n = {};
  for (const lang of APP_LANGS) {
    const tx = DATA.appTexts[lang] && DATA.appTexts[lang][app.id];
    if (!tx) throw new Error("App-Text fehlt: " + lang + "/" + app.id);
    i18n[lang] = tx;
  }
  app.i18n = i18n;
  patched++;
}
cat._note =
  "Fester Katalog - nur Self-Projekte. Neue App = neuen Block in 'apps' anhaengen. " +
  "'apk' = Universal-APK (laeuft auf armv7 UND armv8). Fuer Apps mit Native-Libs stattdessen " +
  "'abis' nutzen: {\"armeabi-v7a\": \"...\", \"arm64-v8a\": \"...\"}. 'id' MUSS die echte " +
  "applicationId sein, sonst funktioniert die Update-Erkennung nicht. Das 'i18n'-Feld " +
  "(pro Sprache tagline/description/category) ist nur fuer die Landing-Sprachumschaltung; " +
  "die App ignoriert es und zeigt die deutschen Basis-Felder.";

fs.writeFileSync(catPath, JSON.stringify(cat, null, 2) + "\n", "utf8");
console.log("catalog.json gepatcht (" + patched + " Apps, i18n mit " + APP_LANGS.length + " Sprachen)");
