#!/usr/bin/env python3
"""SelfStore Katalog-Auto-Sync.

Liest für jede App mit "source": "<owner>/<repo>" das neueste GitHub-Release,
holt versionCode/versionName/Paketname direkt aus dem Release-APK und aktualisiert
catalog.json. Zusätzlich wird der SHA-256 der APK-Datei berechnet und als "sha256"
im Katalog hinterlegt — die SelfStore-App prüft ihn vor der Installation
(Integritätsschutz). Nur Versions-Updates BESTEHENDER Apps — neue Apps werden
weiterhin von Hand angelegt (Beschreibung/Icon/applicationId).
"""
import hashlib
import json
import os
import sys
import tempfile
import urllib.request

CATALOG = "catalog.json"
TOKEN = os.environ.get("GITHUB_TOKEN", "")


def gh_api(path):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {TOKEN}" if TOKEN else "",
            "User-Agent": "selfstore-sync",
        },
    )
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def download(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "selfstore-sync"})
    with urllib.request.urlopen(req) as r, open(dest, "wb") as f:
        f.write(r.read())


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def pick_apk(assets):
    apks = [a for a in assets if a["name"].lower().endswith(".apk")]
    # bevorzugt das versionierte Asset (enthält "-v"), sonst das erste APK
    for a in apks:
        if "-v" in a["name"].lower():
            return a
    return apks[0] if apks else None


def main():
    from pyaxmlparser import APK

    with open(CATALOG, encoding="utf-8") as f:
        cat = json.load(f)

    changed = False
    selfstore_updated = False
    for app in cat.get("apps", []):
        src = app.get("source")
        if not src:
            continue
        try:
            rel = gh_api(f"/repos/{src}/releases/latest")
        except Exception as e:
            print(f"WARN {src}: Release nicht lesbar ({e})")
            continue
        asset = pick_apk(rel.get("assets", []))
        if not asset:
            print(f"WARN {src}: kein APK-Asset gefunden")
            continue
        url = asset["browser_download_url"]
        # Immer herunterladen: liefert Paketname/Version UND SHA-256. So wird der
        # sha256-Hash auch bei unveränderter Version einmalig nachgetragen.
        with tempfile.TemporaryDirectory() as td:
            apkp = os.path.join(td, "app.apk")
            download(url, apkp)
            apk = APK(apkp)
            vc, vn, pkg = int(apk.version_code), apk.version_name, apk.package
            sha = sha256_of(apkp)
        if app.get("id") != pkg:
            print(f"WARN {src}: id '{app.get('id')}' != APK-Package '{pkg}' — übersprungen")
            continue
        new = {"versionName": vn, "versionCode": vc, "apk": url, "sha256": sha}
        if any(app.get(k) != v for k, v in new.items()):
            app.update(new)
            changed = True
            if app["id"] == "com.selfstore.app":
                selfstore_updated = True
            print(f"UPDATE {app['name']}: v{vn} ({vc}) sha256={sha[:12]}… -> {asset['name']}")
        else:
            print(f"OK   {app['name']}: schon aktuell")

    # Bootstrap-APK auf der eigenen Domain aktuell halten (store.selfcoder.de/selfstore.apk)
    if selfstore_updated:
        try:
            rel = gh_api("/repos/s3lfcod3r/selfstore/releases/latest")
            a = next((x for x in rel.get("assets", []) if x["name"] == "selfstore.apk"), None)
            if a:
                download(a["browser_download_url"], "selfstore.apk")
                print("selfstore.apk (Bootstrap) aktualisiert")
        except Exception as e:
            print(f"WARN selfstore.apk: {e}")

    if changed:
        cat["updated"] = os.environ.get("SYNC_DATE", cat.get("updated", ""))
        with open(CATALOG, "w", encoding="utf-8") as f:
            json.dump(cat, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("catalog.json aktualisiert")
    else:
        print("keine Änderungen")


if __name__ == "__main__":
    sys.exit(main())
