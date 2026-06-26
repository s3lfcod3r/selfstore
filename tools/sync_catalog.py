#!/usr/bin/env python3
"""SelfStore Katalog-Auto-Sync.

Liest fuer jede App mit "source": "<owner>/<repo>" das neueste GitHub-Release,
holt versionCode/versionName/Paketname direkt aus dem Release-APK und aktualisiert
catalog.json. Nur Versions-Updates BESTEHENDER Apps — neue Apps werden weiterhin
von Hand angelegt (Beschreibung/Icon/applicationId).
"""
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


def pick_apk(assets):
    apks = [a for a in assets if a["name"].lower().endswith(".apk")]
    # bevorzugt das versionierte Asset (enthaelt "-v"), sonst das erste APK
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
        if app.get("apk") == url:
            print(f"OK   {app['name']}: schon aktuell")
            continue
        with tempfile.TemporaryDirectory() as td:
            apkp = os.path.join(td, "app.apk")
            download(url, apkp)
            apk = APK(apkp)
            vc, vn, pkg = int(apk.version_code), apk.version_name, apk.package
        if app.get("id") != pkg:
            print(f"WARN {src}: id '{app.get('id')}' != APK-Package '{pkg}' — uebersprungen")
            continue
        app["versionName"] = vn
        app["versionCode"] = vc
        app["apk"] = url
        changed = True
        if app["id"] == "com.selfstore.app":
            selfstore_updated = True
        print(f"UPDATE {app['name']}: v{vn} ({vc}) -> {asset['name']}")

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
        print("keine Aenderungen")


if __name__ == "__main__":
    sys.exit(main())
