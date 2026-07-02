#!/usr/bin/env python3
"""Neuen App-Block sicher in catalog.json einfügen.

Aufruf:  python tools/add_app.py <neue-app.json>

<neue-app.json> enthält den App-Block (id/name/source/… — siehe docs/NEUE-APP.md).
Das Skript validiert Pflichtfelder, verhindert doppelte IDs und schreibt catalog.json
sauber (UTF-8, echte Umlaute, 2-Space-Indent). versionName/versionCode/apk/sha256
werden NICHT gesetzt — die trägt der Auto-Sync (sync_catalog.py) aus dem Release nach.
"""
import json
import sys

CATALOG = "catalog.json"
REQUIRED = ("id", "name", "source")


def main(argv):
    if len(argv) != 1:
        print("Aufruf: python tools/add_app.py <neue-app.json>")
        return 2
    with open(argv[0], encoding="utf-8") as f:
        app = json.load(f)

    missing = [k for k in REQUIRED if not app.get(k)]
    if missing:
        print(f"FEHLER: Pflichtfelder fehlen: {', '.join(missing)}")
        return 1
    if not (app.get("apk") or app.get("abis")):
        # Kein Fehler: apk wird vom Auto-Sync gesetzt. Nur Hinweis.
        print("Hinweis: kein 'apk'/'abis' gesetzt — der Auto-Sync trägt die APK-URL nach.")

    with open(CATALOG, encoding="utf-8") as f:
        cat = json.load(f)
    apps = cat.setdefault("apps", [])

    if any(a.get("id") == app["id"] for a in apps):
        print(f"FEHLER: id '{app['id']}' ist bereits im Katalog. (Update läuft über den Auto-Sync.)")
        return 1

    apps.append(app)
    with open(CATALOG, "w", encoding="utf-8") as f:
        json.dump(cat, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"OK: '{app['name']}' ({app['id']}) hinzugefügt. Jetzt Icon ablegen, "
          f"SelfStore-<queries> ergänzen + Release, notify-Workflow+Secret ins App-Repo "
          f"(siehe docs/NEUE-APP.md).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
