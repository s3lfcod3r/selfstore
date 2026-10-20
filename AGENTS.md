# AGENTS.md — selfstore

Kurze Orientierung fuer KI-Assistenten (Bonsai/Claude). **Diese Datei zuerst lesen, nicht die grosse README.**
Zum Finden: `rg -n "BEGRIFF"`. Fuer Symbole: Serena `get_symbols_overview`/`find_symbol`. Grosse Dateien nur zeilenweise (`sed -n`).

## Typ & Stack

- Python: `tools/requirements.txt`
- Android-App: Quellcode in `_android-src/` (gitignored, nie pushen)

## Bauen / Testen / Starten

```bash
python -m pytest -q   # falls Tests vorhanden
bash /mnt/user/appdata/android-build/apk-release.sh selfstore build   # APK bauen
bash /mnt/user/appdata/android-build/apk-release.sh selfstore         # komplettes Release
```

## Struktur (oberste Ebenen)

- `.github/` — CI/Workflows
- `_android-src/` — Android-Quellcode (lokal)
- `docs/` — Dokumentation
- `icons/` — Icons
- `pair/` — Pairing
- `tests/` — Tests
- `tools/` — Hilfsskripte

## Einstiegspunkte

- `index.html`
- `app.js`

---
*Automatisch erzeugt als Navigationshilfe. Bei Bedarf von Hand praeziser machen.*
