# Neue App in den SelfStore aufnehmen

> Für **Updates bestehender Apps** ist nichts zu tun: APK bauen + GitHub-Release
> hochladen, der Auto-Sync zieht Version/APK/SHA-256 automatisch (siehe
> `tools/sync_catalog.py`). Diese Anleitung gilt nur für eine **komplett neue App**.

Eine neue App braucht einmalig vier Schritte. Danach läuft sie vollautomatisch mit.

## 1. Katalog-Eintrag anlegen

Der Auto-Sync kann Name/Beschreibung/Icon/Paket-ID nicht aus einem Release ableiten —
diese Metadaten müssen einmal in `catalog.json`. Am sichersten mit dem Helfer-Skript
(vermeidet JSON-Fehler): eine kleine JSON-Datei mit dem App-Block schreiben und mergen.

`neue-app.json` (Beispiel):
```json
{
  "id": "com.beispiel.app",
  "source": "s3lfcod3r/beispiel",
  "name": "Beispiel",
  "platforms": ["phone"],
  "tagline": "Kurzbeschreibung",
  "taglineEn": "Short description",
  "description": "Längere Beschreibung mit echten Umlauten (ä ö ü ß).",
  "descriptionEn": "Longer English description.",
  "icon": "icons/beispiel.png",
  "category": "Werkzeuge",
  "categoryEn": "Tools",
  "author": "SelfCoder"
}
```
Dann:
```bash
python tools/add_app.py neue-app.json
```
Das Skript prüft Pflichtfelder (`id`, `name`, `source`), lehnt doppelte IDs ab und
schreibt `catalog.json` sauber (UTF-8, echte Umlaute). `versionName`/`versionCode`/
`apk`/`sha256` werden bewusst NICHT gesetzt — die trägt der Auto-Sync beim ersten Lauf
aus dem neuesten Release nach.

- **`id` MUSS die echte applicationId sein** (per `aapt dump badging <apk>` prüfen), sonst
  funktioniert die Update-Erkennung nicht.
- Universal-APK → Feld `apk` überlässt du dem Sync. Native ABIs → stattdessen `abis`-Block
  (`armeabi-v7a`/`arm64-v8a`) verwenden (siehe `_note` in catalog.json).

## 2. Icon ablegen

Das in `icon` genannte PNG nach `icons/` legen (z. B. aus dem Brand-Kit). Landing-Seite
und App laden es von dort.

## 3. Paket-ID in die SelfStore-App aufnehmen (+ SelfStore neu bauen)

Damit der Store bei der neuen App „installiert / Update verfügbar" korrekt erkennt, muss
ihre Paket-ID in die Manifest-`<queries>` der SelfStore-App. (Ohne das zeigt der Store
immer „Installieren".) `QUERY_ALL_PACKAGES` wäre die Alternative, löst aber Play Protect
aus — daher bewusst die enge `<queries>`-Liste.

1. In `<selfstore-app>/app/src/main/AndroidManifest.xml` unter `<queries>` ergänzen:
   `<package android:name="com.beispiel.app" />`
2. versionCode/versionName der SelfStore-App hochzählen und Release bauen (Toolchain:
   siehe interne Notiz; Build `gradle --no-daemon :app:assembleRelease`, Release-Key
   `selfstore-release.jks`).
3. Neues SelfStore-Release hochladen → der Katalog zieht die neue SelfStore-Version selbst.

## 4. Instant-Trigger ins neue App-Repo

Damit auch die neue App bei jedem Release sofort synct:

1. Datei `.github/workflows/notify-selfstore.yml` ins neue App-Repo kopieren (identisch zu
   den anderen App-Repos: `on: release: [published]` → curl auf den
   `workflow_dispatch`-Endpunkt von `s3lfcod3r/selfstore`).
2. Secret setzen:
   ```bash
   gh secret set SELFSTORE_SYNC_TOKEN -R s3lfcod3r/<neues-repo>
   # Wert = fine-grained PAT mit Actions:write NUR auf s3lfcod3r/selfstore
   ```

## Fertig

Ab jetzt gilt für die neue App dasselbe wie für alle anderen: **Release hochladen →
Store aktualisiert sich von selbst** (instant über den Trigger, spätestens per 15-Min-Cron).
