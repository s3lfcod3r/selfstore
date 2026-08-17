// Erzeugt tools/requirements.txt mit gepinnten Versionen + sha256-Hashes.
// Zielumgebung: ubuntu-latest, CPython 3.12, x86_64 (GitHub-Runner).
const https = require('https');

const PKGS = ['pyaxmlparser', 'lxml', 'click', 'asn1crypto'];

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'selfstore-pin' } }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Passt das Artefakt zu CPython 3.12 / manylinux x86_64 (oder ist es universell)?
function matches(f) {
  if (f.packagetype === 'sdist') return true;
  const n = f.filename;
  if (/-py3-none-any\.whl$/.test(n)) return true;
  return /cp312/.test(n) && /manylinux/.test(n) && /x86_64/.test(n);
}

(async () => {
  const lines = [
    '# Gepinnte CI-Abhaengigkeiten fuer tools/sync_catalog.py.',
    '#',
    '# Warum: der Sync-Job hat Schreibrechte und veroeffentlicht catalog.json',
    '# und selfstore.apk. Eine kompromittierte oder getypesquattete Abhaengigkeit',
    '# koennte darueber die APK austauschen, die alle Nutzer installieren.',
    '# --require-hashes im Workflow laesst nur exakt diese Artefakte zu.',
    '#',
    '# Aktualisieren: node tools/gen_requirements.js > tools/requirements.txt',
    '# (Zielumgebung: ubuntu-latest, CPython 3.12, x86_64).',
    '',
  ];
  for (const p of PKGS) {
    const j = await getJson(`https://pypi.org/pypi/${p}/json`);
    const version = j.info.version;
    const files = (j.releases[version] || []).filter(matches);
    if (!files.length) throw new Error(`keine passenden Artefakte fuer ${p} ${version}`);
    const hashes = files.map((f) => `    --hash=sha256:${f.digests.sha256}`);
    lines.push(`${p}==${version} \\`);
    lines.push(hashes.join(' \\\n'));
    lines.push('');
  }
  process.stdout.write(lines.join('\n'));
})();
