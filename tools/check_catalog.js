#!/usr/bin/env node
/**
 * Katalog-Wächter: prüft catalog.json vor dem Veröffentlichen.
 *
 * Hintergrund: Am 2026-08-30 standen in 134 Feldern doppelt kodierte Texte
 * ("fÃ¼r" statt "für") — sichtbar in der App und auf der Landing. Ausserdem war
 * die Datei zwischenzeitlich durch Merge-Konfliktmarker unlesbar. Beides faellt
 * hier sofort auf, statt erst beim Nutzer.
 *
 * Aufruf: node tools/check_catalog.js [catalog.json]
 * Exit 1 = Katalog nicht veroeffentlichen.
 */
const fs = require('fs');
const file = process.argv[2] || 'catalog.json';
const rawBuf = fs.readFileSync(file);
// BOM-Check auf den rohen Buffer (utf8-Read stripet den BOM, der Check wuerde sonst tot sein).
if (rawBuf.length >= 3 && rawBuf[0]===0xEF && rawBuf[1]===0xBB && rawBuf[2]===0xBF) {
  console.error('FEHLER: BOM am Dateianfang (bricht strikte JSON-Parser)');
  process.exit(1);
}
const raw = rawBuf.toString('utf8');
const problems = [];

// Merge-Konfliktmarker vor dem JSON-Parser melden (Konfliktmarker machen das JSON
// sonst ungültig, der Parser bricht ab und der Check wuerde nie greifen).
if (/^(<<<<<<<|=======|>>>>>>>)/m.test(raw)) {
  console.error('FEHLER: Merge-Konfliktmarker in der Datei');
  process.exit(1);
}

let cat;
try {
  cat = JSON.parse(raw);
} catch (e) {
  console.error('FEHLER: catalog.json ist kein gueltiges JSON —', e.message);
  process.exit(1);
}

// Doppelt kodiertes UTF-8: typische Mojibake-Anfangszeichen + Folgebyte-Zeichen.
const MOJI = /[ÂÃÅÎÐ][\u0080-\u00bf]/;
const seen = new Set();
(function walk(node, path) {
  if (node === null || typeof node !== 'object') return;
  for (const k of (Array.isArray(node) ? node.map((_, i) => i) : Object.keys(node))) {
    const v = node[k];
    if (typeof v === 'string') {
      if (MOJI.test(v)) problems.push(`kaputte Umlaute in ${path}.${k}: "${v.slice(0, 60)}"`);
    } else walk(v, `${path}.${k}`);
  }
})(cat, '');

for (const [i, app] of (cat.apps || []).entries()) {
  const where = `apps[${i}] (${app.id || 'ohne id'})`;
  if (app.versionName && !/^\d+\.\d+\.\d+([-.][0-9A-Za-z-]+)*$/.test(app.versionName)) {
    problems.push(where + ": versionName \"" + app.versionName + "\" ist kein gueltiges SemVer");
  }
  for (const field of ['id', 'name']) {
    if (!app[field]) problems.push(`${where}: Pflichtfeld "${field}" fehlt`);
  }
  if (app.id) {
    if (seen.has(app.id)) problems.push(`${where}: doppelte id`);
    seen.add(app.id);
  }
  if (!app.apk && !app.abis) problems.push(`${where}: weder "apk" noch "abis" gesetzt`);
  if (app.apk && !app.sha256) problems.push(`${where}: kein sha256 (Integritaetspruefung faellt aus)`);
  if (app.apk && !/^https:\/\//.test(app.apk)) problems.push(`${where}: apk-URL ist nicht HTTPS`);
}

if (problems.length) {
  console.error(`FEHLER: ${problems.length} Problem(e) im Katalog:`);
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}
console.log(`OK: ${(cat.apps || []).length} Apps, Texte sauber kodiert, alle Pflichtfelder da.`);
