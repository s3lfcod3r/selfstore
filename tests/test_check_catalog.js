// tests/test_check_catalog.js
// Tests für tools/check_catalog.js (Katalog-Wächter)
// Aufruf: node tests/test_check_catalog.js
// Exit 0 = alle Tests bestanden, Exit 1 = Fehler

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const CHECK = path.join(__dirname, '..', 'tools', 'check_catalog.js');
let tmpDir;
let failures = 0;
let passed = 0;

function setup(content) {
  const f = path.join(tmpDir, 'catalog.json');
  fs.writeFileSync(f, content);
  return f;
}

function runCheck(file) {
  try {
    const out = execFileSync('node', [CHECK, file], { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: e.stdout || '', err: e.stderr || '' };
  }
}

function test(name, fn) {
  try {
    fn();
    console.log('  PASS: ' + name);
    passed++;
  } catch (e) {
    console.error('  FAIL: ' + name + ' — ' + e.message);
    failures++;
  }
}

function expectOk(name, file) {
  test(name, () => {
    const r = runCheck(file);
    if (!r.ok) throw new Error('Erwartete Exit 0, bekam: ' + (r.err || r.out));
  });
}

function expectFail(name, file, msg) {
  test(name, () => {
    const r = runCheck(file);
    if (r.ok) throw new Error('Erwartete Fehler, aber Exit 0');
    if (msg && !r.err.includes(msg)) throw new Error('Erwartete Fehlermeldung: ' + msg);
  });
}

function main() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-catalog-'));
  try {
    // --- Gültiger Katalog ---
    const valid = JSON.stringify({
      store: 'SelfStore',
      updated: '2026-10-13',
      apps: [
        { id: 'com.test.a', name: 'Test A', apk: 'https://example.com/a.apk', sha256: 'abc123', versionName: '1.0.0' },
        { id: 'com.test.b', name: 'Test B', apk: 'https://example.com/b.apk', sha256: 'def456', versionName: '2.0.0' },
      ]
    });
    const f1 = setup(valid);
    expectOk('gültiger Katalog → Exit 0', f1);

    // --- Fehlende id ---
    const noId = JSON.stringify({
      store: 'SelfStore',
      apps: [{ name: 'Keine ID', apk: 'https://example.com/x.apk', sha256: 'yyy' }]
    });
    const f3 = setup(noId);
    expectFail('fehlende id → Fehler', f3, 'id');

    // --- Fehlende name ---
    const noName = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.n', apk: 'https://example.com/y.apk', sha256: 'zzz' }]
    });
    const f4 = setup(noName);
    expectFail('fehlende name → Fehler', f4, 'name');

    // --- Fehlende apk und abis ---
    const noApk = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.ap', name: 'Keine APK', sha256: 'aaa' }]
    });
    const f5 = setup(noApk);
    expectFail('weder apk noch abis → Fehler', f5, 'apk');

    // --- Fehlende sha256 bei apk ---
    const noSha = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.sh', name: 'Kein SHA', apk: 'https://example.com/s.apk' }]
    });
    const f6 = setup(noSha);
    expectFail('fehlende sha256 → Fehler', f6, 'sha256');

    // --- APK-URL nicht HTTPS ---
    const noHttps = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.h', name: 'Kein HTTPS', apk: 'http://example.com/h.apk', sha256: 'bbb' }]
    });
    const f7 = setup(noHttps);
    expectFail('APK-URL nicht HTTPS → Fehler', f7, 'HTTPS');

    // --- Doppelte id ---
    const dupId = JSON.stringify({
      store: 'SelfStore',
      apps: [
        { id: 'com.test.dup', name: 'Dup 1', apk: 'https://example.com/d1.apk', sha256: 'ccc' },
        { id: 'com.test.dup', name: 'Dup 2', apk: 'https://example.com/d2.apk', sha256: 'ddd' },
      ]
    });
    const f8 = setup(dupId);
    expectFail('doppelte id → Fehler', f8, 'doppelte id');

    // --- BOM ---
    const bomJson = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.bom', name: 'BOM', apk: 'https://example.com/bom.apk', sha256: 'eee' }]
    });
    const f9 = path.join(tmpDir, 'bom.json');
    fs.writeFileSync(f9, Buffer.from('\uFEFF' + bomJson, 'utf8'));
    expectFail('BOM → Fehler', f9, 'BOM');

    // --- Merge-Konfliktmarker ---
    const cfJson = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.cf', name: 'CF', apk: 'https://example.com/cf.apk', sha256: 'fff' }]
    });
    const f10 = path.join(tmpDir, 'conflict.json');
    fs.writeFileSync(f10, '<<<<<<< HEAD\n' + cfJson + '\n>>>>>>> other');
    expectFail('Merge-Konfliktmarker → Fehler', f10, 'Konflikt');

    // --- Ungültiges JSON ---
    const badJson = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(badJson, '{ invalid json: }');
    expectFail('ungültiges JSON → Fehler', badJson, 'JSON');

    // --- leere apps-Array ---
    const emptyApps = JSON.stringify({ store: 'SelfStore', apps: [] });
    const f11 = setup(emptyApps);
    expectOk('leeres apps-Array → Exit 0', f11);

    // --- versionName kein SemVer ---
    const badVer = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.v', name: 'Bad Ver', apk: 'https://example.com/v.apk', sha256: 'ggg', versionName: 'v1.5.7' }]
    });
    const f13 = setup(badVer);
    expectFail('versionName kein SemVer -> Fehler', f13, 'SemVer');
    // --- versionName gültig ---
    const goodVer = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.gv', name: 'Good Ver', apk: 'https://example.com/gv.apk', sha256: 'hhh', versionName: '1.5.7-beta.1' }]
    });
    const f14 = setup(goodVer);
    expectOk('versionName gültiges SemVer -> Exit 0', f14);
    // --- abis statt apk (keine sha256 nötig) ---
    const abis = JSON.stringify({
      store: 'SelfStore',
      apps: [{ id: 'com.test.ab', name: 'ABIs', abis: { 'arm64-v8a': 'https://example.com/a.apk' } }]
    });
    const f12 = setup(abis);
    expectOk('abis statt apk → Exit 0', f12);

  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  console.log('\n' + passed + ' passed, ' + failures + ' failed');
  if (failures > 0) process.exit(1);
}

main();
