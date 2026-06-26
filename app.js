// SelfStore Landing — DE/EN + XSS-sicheres Katalog-Rendering (textContent,
// nur HTTPS-Links). i18n-Strings sind hartkodierte Konstanten (kein User-Input),
// daher ist innerHTML fuer die [data-i18n-html]-Elemente unbedenklich.
(function () {
  "use strict";

  var SELF_APK =
    "https://github.com/s3lfcod3r/selfstore/releases/latest/download/selfstore.apk";

  var I18N = {
    de: {
      htmlLang: "de",
      title: "SelfStore — Eigener App-Store für Self-Projekte",
      tagline: "Dein eigener App-Store für alle Self-Projekte — ohne Google Play.",
      h2_install: "1 · SelfStore auf die TV-Box holen",
      step1:
        'Auf der Box <b>„Unbekannte Apps zulassen"</b> erlauben (Einstellungen → Sicherheit, bzw. später beim Installieren bestätigen).',
      step2: 'Die App <b>„Downloader"</b> (von AFTVnews) aus dem Box-Store installieren.',
      step3: "In Downloader diese Adresse eingeben:",
      step4:
        "SelfStore installieren — fertig. Ab jetzt verwaltest du alle Self-Apps direkt in SelfStore.",
      btn_download: "SelfStore-APK herunterladen",
      h2_apps: "2 · Enthaltene Apps",
      apps_loading: "Lade Katalog …",
      apps_error: "Katalog konnte nicht geladen werden.",
      footer_src: "Quelle",
      updated_prefix: "Stand",
    },
    en: {
      htmlLang: "en",
      title: "SelfStore — Your own app store for Self projects",
      tagline: "Your own app store for all Self projects — without Google Play.",
      h2_install: "1 · Get SelfStore onto your TV box",
      step1:
        'Allow <b>“install unknown apps”</b> on the box (Settings → Security, or confirm later during install).',
      step2: 'Install the <b>“Downloader”</b> app (by AFTVnews) from the box’s store.',
      step3: "Enter this address in Downloader:",
      step4:
        "Install SelfStore — done. From now on you manage all Self apps right inside SelfStore.",
      btn_download: "Download SelfStore APK",
      h2_apps: "2 · Included apps",
      apps_loading: "Loading catalog …",
      apps_error: "Could not load the catalog.",
      footer_src: "Source",
      updated_prefix: "As of",
    },
  };

  var STORE = { cat: null, lang: "de" };

  function t(lang) {
    return I18N[lang] || I18N.de;
  }

  function detectLang() {
    try {
      var s = localStorage.getItem("selfstore-lang");
      if (s === "de" || s === "en") return s;
    } catch (e) {}
    return (navigator.language || "de").toLowerCase().indexOf("de") === 0 ? "de" : "en";
  }

  function httpsOnly(u) {
    return typeof u === "string" && /^https:\/\//i.test(u) ? u : "#";
  }
  function allowedIcon(u) {
    return typeof u === "string" && (/^https:\/\//i.test(u) || /^icons\//.test(u));
  }
  function field(a, base, lang) {
    if (lang === "en") return a[base + "En"] || a[base] || "";
    return a[base] || "";
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
    document.querySelectorAll(".lang").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
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
      ver.textContent = "v" + (a.versionName || "?") + " · " + field(a, "category", lang);

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

  document.querySelectorAll(".lang").forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.getAttribute("data-lang"));
    });
  });

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
