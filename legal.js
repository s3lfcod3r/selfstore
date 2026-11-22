/* SelfBike / SelfCoder – Impressum & Datenschutz als Self-Design-Popup.
   Eigenständiges klassisches Script (keine Abhängigkeiten, keine externen Requests).
   Nutzung:
     <a href="#" data-legal="impressum">Impressum</a>
     <a href="#" data-legal="datenschutz">Datenschutz</a>
     <script src="lib/legal.js"></script>
   oder window.openLegal('impressum' | 'datenschutz').
   Inhalt zentral hier gepflegt – auf allen Self-Seiten identisch. */
(function () {
  'use strict';

  // E-Mail nicht als Klartext im Quelltext (leichter Spam-Schutz), erst beim Öffnen zusammengesetzt.
  var MAIL = ['info', 'selfcoder.de'];
  function mail() { return MAIL[0] + '@' + MAIL[1]; }
  function mailLink() { return '<a href="mailto:' + mail() + '">' + mail() + '</a>'; }

  var TITLE = { impressum: 'Impressum', datenschutz: 'Datenschutzerklärung' };

  function impressum() {
    return '' +
      '<p><strong>Selfcoder — Sven Schmidt</strong><br>' +
      'c/o Online-Impressum 13327<br>' +
      'Europaring 90<br>' +
      '53757 Sankt Augustin</p>' +
      '<p>E-Mail: ' + mailLink() + '</p>' +
      '<p><strong>Zuständige Aufsichtsbehörde</strong><br>' +
      'Medienanstalt Hamburg/Schleswig-Holstein</p>' +
      '<p class="sbl-muted">Nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer ' +
      'Verbraucherschlichtungsstelle teilzunehmen.</p>' +
      '<p class="sbl-muted">Die Anschrift ist eine ladungsfähige Ersatz-Anschrift (Impressumsdienst); ' +
      'sie gilt für alle Self-Seiten (selfcoder.de und Subdomains).</p>';
  }

  function datenschutz() {
    return '' +
      '<h4>1. Verantwortlicher</h4>' +
      '<p>Sven Schmidt, c/o Online-Impressum 13327, Europaring 90, 53757 Sankt Augustin · ' +
      'E-Mail: ' + mailLink() + ' (siehe Impressum).</p>' +

      '<h4>2. Hosting</h4>' +
      '<p>Diese Seite wird über <strong>GitHub Pages</strong> (GitHub Inc., USA) bereitgestellt, die Domain ' +
      'läuft über <strong>Cloudflare</strong> (Cloudflare Inc., USA). Beim Aufruf verarbeiten diese Dienste ' +
      'technisch notwendige Server-Logdaten (u. a. IP-Adresse, Zeitpunkt, abgerufene Datei) zur sicheren ' +
      'Auslieferung. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (sicherer Betrieb). Für die Übermittlung in ' +
      'die USA greifen die Standardvertragsklauseln der Anbieter.</p>' +

      '<h4>3. Lokale Speicherung im Browser</h4>' +
      '<p>Einstellungen (z. B. Sprache) werden nur <strong>lokal in deinem Browser</strong> (localStorage) ' +
      'gespeichert und <strong>nicht</strong> an uns übertragen. Du kannst sie jederzeit über die ' +
      'Browser-Einstellungen löschen. <strong>Keine Cookies, kein Tracking, keine Analyse-Tools, keine ' +
      'Nutzerkonten.</strong></p>' +

      '<h4>4. Anonyme Nutzung (nur SelfBike)</h4>' +
      '<p>Beim Auslesen sendet SelfBike einen anonymen Zähl-Ping (System-Typ + gewählte Sprache); das Land ' +
      'wird serverseitig grob aus der Verbindung abgeleitet, <strong>ohne deine IP zu speichern</strong>. Der ' +
      'freiwillige „Zur Liste beitragen“-Knopf überträgt <strong>nur Modell-Codes deines Rads</strong>, keine ' +
      'Seriennummern oder persönlichen Daten. Die Verbindung zum E-Bike (USB) läuft <strong>lokal</strong> im ' +
      'Browser — es werden keine Fahrzeugdaten an uns gesendet.</p>' +

      '<h4>5. Externe Dienste (je nach Seite)</h4>' +
      '<p>Je nach Anwendung werden externe Fachdienste direkt in deinem Browser aufgerufen; dabei wird ' +
      'technisch bedingt deine IP-Adresse an den jeweiligen Anbieter übertragen. <strong>SelfStorm</strong> ' +
      '(Wetter) nutzt dafür Open-Meteo, den DWD über Bright Sky sowie Zippopotam (PLZ-Auflösung). Links zu ' +
      'externen Seiten (z. B. Ko-fi) werden erst beim Anklicken aufgerufen.</p>' +

      '<h4>6. Deine Rechte</h4>' +
      '<p>Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch und Datenübertragbarkeit ' +
      '(Art. 15–21 DSGVO) — per E-Mail an ' + mailLink() + '. Beschwerderecht bei der Aufsichtsbehörde: ' +
      '<strong>Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit</strong>.</p>' +

      '<h4>7. Stand</h4>' +
      '<p class="sbl-muted">Diese Erklärung wird bei Bedarf angepasst. Stand: November 2026.</p>';
  }

  var BODY = { impressum: impressum, datenschutz: datenschutz };

  var styled = false;
  function injectStyle() {
    if (styled) return; styled = true;
    var css = '' +
      '.sbl-ov{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
      'padding:16px;background:rgba(3,7,12,.68);backdrop-filter:blur(3px);animation:sbl-f .18s ease}' +
      '@keyframes sbl-f{from{opacity:0}to{opacity:1}}' +
      '.sbl-card{width:100%;max-width:460px;max-height:86vh;display:flex;flex-direction:column;' +
      'background:var(--self-bg-1,#0d1117);color:var(--self-text,#eef4f7);' +
      'border:1px solid var(--self-line,rgba(157,189,208,.18));border-radius:18px;' +
      'box-shadow:0 30px 80px rgba(0,0,0,.6);font-family:var(--self-font-sans,system-ui,sans-serif)}' +
      '.sbl-hd{display:flex;align-items:center;gap:10px;padding:16px 18px 13px;' +
      'border-bottom:1px solid var(--self-line,rgba(157,189,208,.18))}' +
      '.sbl-hd .sbl-ic{font-size:18px}.sbl-hd h3{margin:0;font-size:17px;letter-spacing:-.01em;flex:1}' +
      '.sbl-x{appearance:none;border:0;background:transparent;color:var(--self-text-2,#8a9caa);' +
      'font-size:18px;cursor:pointer;line-height:1;padding:4px;border-radius:8px}' +
      '.sbl-x:hover{color:var(--self-text,#eef4f7);background:var(--self-bg-2,#161b22)}' +
      '.sbl-bd{padding:14px 18px 18px;overflow:auto;font-size:13.5px;line-height:1.6}' +
      '.sbl-bd h4{margin:16px 0 5px;font-size:13px;color:var(--self-teal-bright,#43d3ad);' +
      'text-transform:uppercase;letter-spacing:.04em}' +
      '.sbl-bd h4:first-child{margin-top:0}' +
      '.sbl-bd p{margin:0 0 9px}.sbl-bd a{color:var(--self-teal-bright,#43d3ad)}' +
      '.sbl-bd strong{color:var(--self-text,#eef4f7)}' +
      '.sbl-muted{color:var(--self-text-2,#8a9caa);font-size:12.5px}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  }

  function open(kind) {
    if (kind !== 'datenschutz') kind = kind === 'impressum' ? 'impressum' : 'impressum';
    injectStyle();
    var ov = document.createElement('div');
    ov.className = 'sbl-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');

    function close() { if (ov.parentNode) ov.parentNode.removeChild(ov); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });

    var ic = kind === 'datenschutz' ? '🔒' : '⚖️'; // 🔒 / ⚖️
    ov.innerHTML = '<div class="sbl-card">' +
      '<div class="sbl-hd"><span class="sbl-ic">' + ic + '</span><h3>' + TITLE[kind] + '</h3>' +
      '<button class="sbl-x" aria-label="Schließen">✕</button></div>' +
      '<div class="sbl-bd">' + BODY[kind]() + '</div></div>';
    document.body.appendChild(ov);
    ov.querySelector('.sbl-x').onclick = close;
    var bd = ov.querySelector('.sbl-bd'); if (bd) bd.scrollTop = 0;
  }

  function wire() {
    var els = document.querySelectorAll('[data-legal]');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        if (el.getAttribute('data-legal-wired')) return;
        el.setAttribute('data-legal-wired', '1');
        el.addEventListener('click', function (e) {
          e.preventDefault();
          open(el.getAttribute('data-legal'));
        });
      })(els[i]);
    }
  }

  window.openLegal = open;
  window.SelfBikeLegal = { open: open, wire: wire };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
