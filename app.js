// SelfStore Landing - 12 Sprachen (i18n) + XSS-sicheres Katalog-Rendering
// (textContent, nur HTTPS-Links). i18n-Strings sind hartkodierte Konstanten
// (kein User-Input), daher ist innerHTML fuer die [data-i18n-html]-Elemente
// unbedenklich. Generiert aus tools/i18n-data.json.
(function () {
  "use strict";

  var SELF_APK = "https://store.selfcoder.de/selfstore.apk";

  // Reihenfolge = Anzeige im Sprachwaehler. label = nativer Sprachname.
  var LANGS = [{"code":"de","label":"Deutsch"},{"code":"en","label":"English"},{"code":"fr","label":"Fran\u00e7ais"},{"code":"es","label":"Espa\u00f1ol"},{"code":"it","label":"Italiano"},{"code":"nl","label":"Nederlands"},{"code":"pl","label":"Polski"},{"code":"pt","label":"Portugu\u00eas"},{"code":"sv","label":"Svenska"},{"code":"da","label":"Dansk"},{"code":"cs","label":"\u010ce\u0161tina"},{"code":"el","label":"\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac"}];
  var CODES = LANGS.map(function (l) { return l.code; });

  var I18N = {
      "de": {
          "htmlLang": "de",
          "title": "SelfStore \u2014 Eigener App-Store f\u00fcr Self-Projekte",
          "tagline": "Dein eigener App-Store f\u00fcr alle Self-Projekte \u2014 ohne Google Play.",
          "h2_install": "1 \u00b7 SelfStore auf die TV-Box holen",
          "step1": "Auf der Box <b>\u201eUnbekannte Apps zulassen\u201c</b> erlauben (Einstellungen \u2192 Sicherheit, bzw. sp\u00e4ter beim Installieren best\u00e4tigen).",
          "step2": "Die App <b>\u201eDownloader\u201c</b> (von AFTVnews) aus dem Box-Store installieren.",
          "step3": "In Downloader diese Adresse eingeben:",
          "step4": "SelfStore installieren \u2014 fertig. Ab jetzt verwaltest du alle Self-Apps direkt in SelfStore.",
          "btn_download": "SelfStore-APK herunterladen",
          "h2_apps": "2 \u00b7 Enthaltene Apps",
          "apps_loading": "Lade Katalog \u2026",
          "apps_error": "Katalog konnte nicht geladen werden.",
          "footer_src": "Quelle",
          "updated_prefix": "Stand"
      },
      "en": {
          "htmlLang": "en",
          "title": "SelfStore \u2014 Your own app store for Self projects",
          "tagline": "Your own app store for all Self projects \u2014 without Google Play.",
          "h2_install": "1 \u00b7 Get SelfStore onto your TV box",
          "step1": "Allow <b>\u201cinstall unknown apps\u201d</b> on the box (Settings \u2192 Security, or confirm later during install).",
          "step2": "Install the <b>\u201cDownloader\u201d</b> app (by AFTVnews) from the box\u2019s store.",
          "step3": "Enter this address in Downloader:",
          "step4": "Install SelfStore \u2014 done. From now on you manage all Self apps right inside SelfStore.",
          "btn_download": "Download SelfStore APK",
          "h2_apps": "2 \u00b7 Included apps",
          "apps_loading": "Loading catalog \u2026",
          "apps_error": "Could not load the catalog.",
          "footer_src": "Source",
          "updated_prefix": "As of"
      },
      "fr": {
          "htmlLang": "fr",
          "title": "SelfStore \u2014 Votre propre magasin d'applis pour les projets Self",
          "tagline": "Votre propre magasin d'applis pour tous les projets Self \u2014 sans Google Play.",
          "h2_install": "1 \u00b7 Installer SelfStore sur votre box TV",
          "step1": "Autorisez <b>\u00ab l'installation d'applis inconnues \u00bb</b> sur la box (Param\u00e8tres \u2192 S\u00e9curit\u00e9, ou confirmez plus tard pendant l'installation).",
          "step2": "Installez l'appli <b>\u00ab Downloader \u00bb</b> (de AFTVnews) depuis le magasin de la box.",
          "step3": "Saisissez cette adresse dans Downloader :",
          "step4": "Installez SelfStore \u2014 c'est fait. \u00c0 partir de maintenant, vous g\u00e9rez toutes vos applis Self directement dans SelfStore.",
          "btn_download": "T\u00e9l\u00e9charger l'APK SelfStore",
          "h2_apps": "2 \u00b7 Applis incluses",
          "apps_loading": "Chargement du catalogue \u2026",
          "apps_error": "Impossible de charger le catalogue.",
          "footer_src": "Source",
          "updated_prefix": "Au"
      },
      "es": {
          "htmlLang": "es",
          "title": "SelfStore \u2014 Tu propia tienda de aplicaciones para los proyectos Self",
          "tagline": "Tu propia tienda de aplicaciones para todos los proyectos Self, sin Google Play.",
          "h2_install": "1 \u00b7 Instala SelfStore en tu TV box",
          "step1": "Permite <b>\u00abinstalar apps de origen desconocido\u00bb</b> en el dispositivo (Ajustes \u2192 Seguridad, o conf\u00edrmalo m\u00e1s tarde durante la instalaci\u00f3n).",
          "step2": "Instala la app <b>\u00abDownloader\u00bb</b> (de AFTVnews) desde la tienda del dispositivo.",
          "step3": "Introduce esta direcci\u00f3n en Downloader:",
          "step4": "Instala SelfStore y listo. A partir de ahora gestionas todas las apps Self directamente desde SelfStore.",
          "btn_download": "Descargar el APK de SelfStore",
          "h2_apps": "2 \u00b7 Apps incluidas",
          "apps_loading": "Cargando cat\u00e1logo \u2026",
          "apps_error": "No se pudo cargar el cat\u00e1logo.",
          "footer_src": "Fuente",
          "updated_prefix": "A fecha de"
      },
      "it": {
          "htmlLang": "it",
          "title": "SelfStore \u2014 Il tuo store di app per i progetti Self",
          "tagline": "Il tuo store di app per tutti i progetti Self \u2014 senza Google Play.",
          "h2_install": "1 \u00b7 Installa SelfStore sul tuo TV box",
          "step1": "Consenti <b>\u00abl'installazione di app sconosciute\u00bb</b> sul box (Impostazioni \u2192 Sicurezza, oppure conferma pi\u00f9 tardi durante l'installazione).",
          "step2": "Installa l'app <b>\u00abDownloader\u00bb</b> (di AFTVnews) dallo store del box.",
          "step3": "Inserisci questo indirizzo in Downloader:",
          "step4": "Installa SelfStore \u2014 fatto. D'ora in poi gestisci tutte le app Self direttamente da SelfStore.",
          "btn_download": "Scarica l'APK di SelfStore",
          "h2_apps": "2 \u00b7 App incluse",
          "apps_loading": "Caricamento del catalogo \u2026",
          "apps_error": "Impossibile caricare il catalogo.",
          "footer_src": "Fonte",
          "updated_prefix": "Aggiornato al"
      },
      "nl": {
          "htmlLang": "nl",
          "title": "SelfStore \u2014 Je eigen appstore voor Self-projecten",
          "tagline": "Je eigen appstore voor alle Self-projecten \u2014 zonder Google Play.",
          "h2_install": "1 \u00b7 SelfStore op je TV-box krijgen",
          "step1": "Sta <b>\u201eonbekende apps installeren\u201c</b> toe op de box (Instellingen \u2192 Beveiliging, of bevestig later tijdens het installeren).",
          "step2": "Installeer de app <b>\u201eDownloader\u201c</b> (van AFTVnews) uit de store van de box.",
          "step3": "Voer dit adres in bij Downloader:",
          "step4": "Installeer SelfStore \u2014 klaar. Vanaf nu beheer je al je Self-apps rechtstreeks in SelfStore.",
          "btn_download": "SelfStore APK downloaden",
          "h2_apps": "2 \u00b7 Inbegrepen apps",
          "apps_loading": "Catalogus laden \u2026",
          "apps_error": "Kon de catalogus niet laden.",
          "footer_src": "Bron",
          "updated_prefix": "Bijgewerkt op"
      },
      "pl": {
          "htmlLang": "pl",
          "title": "SelfStore \u2014 Tw\u00f3j w\u0142asny sklep z aplikacjami do projekt\u00f3w Self",
          "tagline": "Tw\u00f3j w\u0142asny sklep z aplikacjami do wszystkich projekt\u00f3w Self \u2014 bez Google Play.",
          "h2_install": "1 \u00b7 Zainstaluj SelfStore na swoim urz\u0105dzeniu TV",
          "step1": "Zezw\u00f3l na <b>\u201einstalowanie nieznanych aplikacji\u201d</b> na urz\u0105dzeniu (Ustawienia \u2192 Zabezpieczenia, albo potwierd\u017a p\u00f3\u017aniej podczas instalacji).",
          "step2": "Zainstaluj aplikacj\u0119 <b>\u201eDownloader\u201d</b> (od AFTVnews) ze sklepu na urz\u0105dzeniu.",
          "step3": "Wpisz ten adres w Downloaderze:",
          "step4": "Zainstaluj SelfStore \u2014 gotowe. Od teraz wszystkie aplikacje Self ogarniasz bezpo\u015brednio w SelfStore.",
          "btn_download": "Pobierz APK SelfStore",
          "h2_apps": "2 \u00b7 Dost\u0119pne aplikacje",
          "apps_loading": "Wczytywanie katalogu \u2026",
          "apps_error": "Nie uda\u0142o si\u0119 wczyta\u0107 katalogu.",
          "footer_src": "\u0179r\u00f3d\u0142o",
          "updated_prefix": "Stan na"
      },
      "pt": {
          "htmlLang": "pt",
          "title": "SelfStore \u2014 A sua pr\u00f3pria loja de aplica\u00e7\u00f5es para projetos Self",
          "tagline": "A sua pr\u00f3pria loja de aplica\u00e7\u00f5es para todos os projetos Self \u2014 sem o Google Play.",
          "h2_install": "1 \u00b7 Instalar o SelfStore na sua caixa de TV",
          "step1": "Permita a <b>\u00abinstala\u00e7\u00e3o de aplica\u00e7\u00f5es desconhecidas\u00bb</b> na caixa (Defini\u00e7\u00f5es \u2192 Seguran\u00e7a, ou confirme mais tarde durante a instala\u00e7\u00e3o).",
          "step2": "Instale a aplica\u00e7\u00e3o <b>\u00abDownloader\u00bb</b> (da AFTVnews) a partir da loja da caixa.",
          "step3": "Introduza este endere\u00e7o no Downloader:",
          "step4": "Instale o SelfStore \u2014 pronto. A partir de agora gere todas as aplica\u00e7\u00f5es Self diretamente dentro do SelfStore.",
          "btn_download": "Transferir o APK do SelfStore",
          "h2_apps": "2 \u00b7 Aplica\u00e7\u00f5es inclu\u00eddas",
          "apps_loading": "A carregar o cat\u00e1logo \u2026",
          "apps_error": "N\u00e3o foi poss\u00edvel carregar o cat\u00e1logo.",
          "footer_src": "Origem",
          "updated_prefix": "Atualizado a"
      },
      "sv": {
          "htmlLang": "sv",
          "title": "SelfStore \u2014 Din egen appbutik f\u00f6r Self-projekt",
          "tagline": "Din egen appbutik f\u00f6r alla Self-projekt \u2014 utan Google Play.",
          "h2_install": "1 \u00b7 F\u00e5 in SelfStore p\u00e5 din TV-box",
          "step1": "Till\u00e5t <b>\u201dinstallera ok\u00e4nda appar\u201d</b> p\u00e5 boxen (Inst\u00e4llningar \u2192 S\u00e4kerhet, eller bekr\u00e4fta senare under installationen).",
          "step2": "Installera appen <b>\u201dDownloader\u201d</b> (fr\u00e5n AFTVnews) via boxens butik.",
          "step3": "Ange den h\u00e4r adressen i Downloader:",
          "step4": "Installera SelfStore \u2014 klart. Fr\u00e5n och med nu sk\u00f6ter du alla Self-appar direkt i SelfStore.",
          "btn_download": "Ladda ner SelfStore APK",
          "h2_apps": "2 \u00b7 Appar som ing\u00e5r",
          "apps_loading": "Laddar katalog \u2026",
          "apps_error": "Det gick inte att ladda katalogen.",
          "footer_src": "K\u00e4lla",
          "updated_prefix": "Per"
      },
      "da": {
          "htmlLang": "da",
          "title": "SelfStore \u2014 Din egen app-butik til Self-projekter",
          "tagline": "Din egen app-butik til alle Self-projekter \u2014 uden Google Play.",
          "h2_install": "1 \u00b7 F\u00e5 SelfStore p\u00e5 din TV-boks",
          "step1": "Tillad <b>\u201dinstallation af ukendte apps\u201d</b> p\u00e5 boksen (Indstillinger \u2192 Sikkerhed, eller bekr\u00e6ft det senere under installationen).",
          "step2": "Install\u00e9r <b>\u201dDownloader\u201d</b>-appen (fra AFTVnews) fra boksens butik.",
          "step3": "Indtast denne adresse i Downloader:",
          "step4": "Install\u00e9r SelfStore \u2014 f\u00e6rdig. Fra nu af styrer du alle Self-apps direkte inde i SelfStore.",
          "btn_download": "Download SelfStore APK",
          "h2_apps": "2 \u00b7 Inkluderede apps",
          "apps_loading": "Indl\u00e6ser katalog \u2026",
          "apps_error": "Kataloget kunne ikke indl\u00e6ses.",
          "footer_src": "Kilde",
          "updated_prefix": "Pr."
      },
      "cs": {
          "htmlLang": "cs",
          "title": "SelfStore \u2014 V\u00e1\u0161 vlastn\u00ed obchod s aplikacemi pro projekty Self",
          "tagline": "V\u00e1\u0161 vlastn\u00ed obchod s aplikacemi pro v\u0161echny projekty Self \u2014 bez Google Play.",
          "h2_install": "1 \u00b7 Dosta\u0148te SelfStore do sv\u00e9ho TV boxu",
          "step1": "Povolte na boxu <b>\u201einstalaci nezn\u00e1m\u00fdch aplikac\u00ed\u201c</b> (Nastaven\u00ed \u2192 Zabezpe\u010den\u00ed, nebo potvr\u010fte pozd\u011bji b\u011bhem instalace).",
          "step2": "Nainstalujte aplikaci <b>\u201eDownloader\u201c</b> (od AFTVnews) z obchodu ve sv\u00e9m boxu.",
          "step3": "Zadejte tuto adresu do Downloaderu:",
          "step4": "Nainstalujte SelfStore \u2014 hotovo. Od te\u010f spravujete v\u0161echny aplikace Self p\u0159\u00edmo v SelfStore.",
          "btn_download": "St\u00e1hnout SelfStore APK",
          "h2_apps": "2 \u00b7 Zahrnut\u00e9 aplikace",
          "apps_loading": "Na\u010d\u00edt\u00e1n\u00ed katalogu \u2026",
          "apps_error": "Katalog se nepoda\u0159ilo na\u010d\u00edst.",
          "footer_src": "Zdroj",
          "updated_prefix": "Stav ke dni"
      },
      "el": {
          "htmlLang": "el",
          "title": "SelfStore \u2014 \u03a4\u03bf \u03b4\u03b9\u03ba\u03cc \u03c3\u03bf\u03c5 \u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b7\u03bc\u03b1 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ce\u03bd \u03b3\u03b9\u03b1 \u03c4\u03b1 \u03ad\u03c1\u03b3\u03b1 Self",
          "tagline": "\u03a4\u03bf \u03b4\u03b9\u03ba\u03cc \u03c3\u03bf\u03c5 \u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b7\u03bc\u03b1 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ce\u03bd \u03b3\u03b9\u03b1 \u03cc\u03bb\u03b1 \u03c4\u03b1 \u03ad\u03c1\u03b3\u03b1 Self \u2014 \u03c7\u03c9\u03c1\u03af\u03c2 Google Play.",
          "h2_install": "1 \u00b7 \u0395\u03b3\u03ba\u03b1\u03c4\u03ad\u03c3\u03c4\u03b7\u03c3\u03b5 \u03c4\u03bf SelfStore \u03c3\u03c4\u03bf TV box \u03c3\u03bf\u03c5",
          "step1": "\u0395\u03c0\u03af\u03c4\u03c1\u03b5\u03c8\u03b5 \u03c4\u03b7\u03bd <b>\u00ab\u03b5\u03b3\u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b1\u03c3\u03b7 \u03ac\u03b3\u03bd\u03c9\u03c3\u03c4\u03c9\u03bd \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ce\u03bd\u00bb</b> \u03c3\u03c4\u03bf box (\u03a1\u03c5\u03b8\u03bc\u03af\u03c3\u03b5\u03b9\u03c2 \u2192 \u0391\u03c3\u03c6\u03ac\u03bb\u03b5\u03b9\u03b1, \u03ae \u03b5\u03c0\u03b9\u03b2\u03b5\u03b2\u03b1\u03af\u03c9\u03c3\u03ad \u03c4\u03bf \u03b1\u03c1\u03b3\u03cc\u03c4\u03b5\u03c1\u03b1 \u03ba\u03b1\u03c4\u03ac \u03c4\u03b7\u03bd \u03b5\u03b3\u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b1\u03c3\u03b7).",
          "step2": "\u0395\u03b3\u03ba\u03b1\u03c4\u03ad\u03c3\u03c4\u03b7\u03c3\u03b5 \u03c4\u03b7\u03bd \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ae <b>\u00abDownloader\u00bb</b> (\u03b1\u03c0\u03cc \u03c4\u03b7\u03bd AFTVnews) \u03b1\u03c0\u03cc \u03c4\u03bf \u03ba\u03b1\u03c4\u03ac\u03c3\u03c4\u03b7\u03bc\u03b1 \u03c4\u03bf\u03c5 box.",
          "step3": "\u03a0\u03bb\u03b7\u03ba\u03c4\u03c1\u03bf\u03bb\u03cc\u03b3\u03b7\u03c3\u03b5 \u03b1\u03c5\u03c4\u03ae \u03c4\u03b7 \u03b4\u03b9\u03b5\u03cd\u03b8\u03c5\u03bd\u03c3\u03b7 \u03c3\u03c4\u03bf Downloader:",
          "step4": "\u0395\u03b3\u03ba\u03b1\u03c4\u03ad\u03c3\u03c4\u03b7\u03c3\u03b5 \u03c4\u03bf SelfStore \u2014 \u03ad\u03c4\u03bf\u03b9\u03bc\u03bf. \u0391\u03c0\u03cc \u03b5\u03b4\u03ce \u03ba\u03b1\u03b9 \u03c0\u03ad\u03c1\u03b1 \u03b4\u03b9\u03b1\u03c7\u03b5\u03b9\u03c1\u03af\u03b6\u03b5\u03c3\u03b1\u03b9 \u03cc\u03bb\u03b5\u03c2 \u03c4\u03b9\u03c2 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ad\u03c2 Self \u03bc\u03ad\u03c3\u03b1 \u03b1\u03c0\u03cc \u03c4\u03bf SelfStore.",
          "btn_download": "\u039b\u03ae\u03c8\u03b7 SelfStore APK",
          "h2_apps": "2 \u00b7 \u03a0\u03b5\u03c1\u03b9\u03bb\u03b1\u03bc\u03b2\u03b1\u03bd\u03cc\u03bc\u03b5\u03bd\u03b5\u03c2 \u03b5\u03c6\u03b1\u03c1\u03bc\u03bf\u03b3\u03ad\u03c2",
          "apps_loading": "\u03a6\u03cc\u03c1\u03c4\u03c9\u03c3\u03b7 \u03ba\u03b1\u03c4\u03b1\u03bb\u03cc\u03b3\u03bf\u03c5 \u2026",
          "apps_error": "\u0394\u03b5\u03bd \u03ae\u03c4\u03b1\u03bd \u03b4\u03c5\u03bd\u03b1\u03c4\u03ae \u03b7 \u03c6\u03cc\u03c1\u03c4\u03c9\u03c3\u03b7 \u03c4\u03bf\u03c5 \u03ba\u03b1\u03c4\u03b1\u03bb\u03cc\u03b3\u03bf\u03c5.",
          "footer_src": "\u03a0\u03b7\u03b3\u03ae",
          "updated_prefix": "\u0395\u03bd\u03b7\u03bc\u03ad\u03c1\u03c9\u03c3\u03b7"
      }
  };

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
    return typeof u === "string" && /^https:\/\//i.test(u) ? u : "#";
  }
  function allowedIcon(u) {
    return typeof u === "string" && (/^https:\/\//i.test(u) || /^icons\//.test(u));
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
      ver.textContent = "v" + (a.versionName || "?") + " \u00b7 " + field(a, "category", lang);

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
