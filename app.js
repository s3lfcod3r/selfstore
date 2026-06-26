// SelfStore Landing — rendert den Katalog XSS-sicher (textContent statt innerHTML),
// erlaubt nur HTTPS-Links. Externe Datei, damit eine strikte CSP greifen kann.
(function () {
  "use strict";

  var SELF_APK =
    "https://github.com/s3lfcod3r/selfstore/releases/latest/download/selfstore.apk";

  var dl = document.getElementById("dl-self");
  if (dl) dl.href = SELF_APK;
  var su = document.getElementById("self-url");
  if (su) su.textContent = SELF_APK;

  function httpsOnly(u) {
    return typeof u === "string" && /^https:\/\//i.test(u) ? u : "#";
  }
  function allowedIcon(u) {
    return typeof u === "string" && (/^https:\/\//i.test(u) || /^icons\//.test(u));
  }

  fetch("catalog.json", { cache: "no-cache" })
    .then(function (r) {
      return r.json();
    })
    .then(function (cat) {
      var upd = document.getElementById("updated");
      if (upd) upd.textContent = "Stand " + (cat.updated || "");

      var host = document.getElementById("apps");
      host.textContent = "";

      (cat.apps || []).forEach(function (a) {
        var apk = httpsOnly(
          a.apk || (a.abis && (a.abis["arm64-v8a"] || a.abis["armeabi-v7a"]))
        );

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
        tl.textContent = a.tagline || "";

        var desc = document.createElement("div");
        desc.className = "desc";
        desc.textContent = a.description || "";

        var ver = document.createElement("div");
        ver.className = "ver";
        ver.textContent = "v" + (a.versionName || "?") + " · " + (a.category || "App");

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
    })
    .catch(function () {
      var host = document.getElementById("apps");
      if (!host) return;
      host.textContent = "";
      var d = document.createElement("div");
      d.className = "card";
      d.textContent = "Katalog konnte nicht geladen werden.";
      host.appendChild(d);
    });
})();
