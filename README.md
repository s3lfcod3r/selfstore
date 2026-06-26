# SelfStore — Katalog & Landingpage

Eigener, fester App-Store **nur für Self-Projekte**. Dieses Repo liefert zwei Dinge
über **GitHub Pages**:

1. **`catalog.json`** — die Liste der Apps, die die SelfStore-Android-App ausliest.
2. **`index.html`** — eine Landingpage zum Bootstrappen (SelfStore-APK + Downloader-Code).

Live-URL (nach Pages-Aktivierung): `https://s3lfcod3r.github.io/selfstore/`
Katalog: `https://s3lfcod3r.github.io/selfstore/catalog.json`

---

## GitHub Pages aktivieren (einmalig)

1. Repo `selfstore` unter dem Konto **s3lfcod3r** anlegen, diesen Ordner pushen.
2. GitHub → Repo → **Settings → Pages** → Source: `Deploy from a branch`,
   Branch `main` / `/ (root)`.
3. Nach ~1 Min ist `https://s3lfcod3r.github.io/selfstore/` live.

> Die SelfStore-App ist fest auf `https://s3lfcod3r.github.io/selfstore/catalog.json`
> verdrahtet (`CATALOG_URL` in `Catalog.kt`). Anderer Pfad → dort anpassen.

---

## Neue App in den Store legen

Block in `catalog.json` → `apps` anhängen:

```json
{
  "id": "com.beispiel.app",        // ECHTE applicationId (Pflicht, sonst keine Update-Erkennung)
  "name": "SelfBeispiel",
  "tagline": "Kurzbeschreibung",
  "description": "Längerer Text …",
  "icon": "icons/self-beispiel.png",
  "category": "Tools",
  "author": "SelfCoder",
  "versionName": "1.0.0",
  "versionCode": 1,                // muss bei jedem Update hochgezählt werden
  "apk": "https://github.com/s3lfcod3r/<repo>/releases/latest/download/<datei>.apk"
}
```

### armv7 / armv8

- **Apps ohne Native-Code** (WebView-Wrapper, reine Compose-Apps): ein
  **Universal-APK** im Feld `apk` reicht — läuft auf armv7 **und** armv8.
- **Apps mit Native-Libs** (`.so`): statt `apk` das Feld `abis` nutzen, die App
  wählt automatisch die passende:

```json
"abis": {
  "armeabi-v7a": "https://…/app-armeabi-v7a.apk",
  "arm64-v8a":   "https://…/app-arm64-v8a.apk"
}
```

> **SelfStream Player** kommt bewusst **NICHT** in diesen öffentlichen Katalog.

---

## Release-Konvention (APK-Dateinamen)

Pro Release **zwei Assets** hochladen:

- **`<App>-v<Version>.apk`** (z. B. `SelfStore-v1.0.1.apk`) — versioniert, wird in
  `catalog.json` verlinkt. Einheitlich mit den anderen Self-Apps.
- **`selfstore.apk`** (stabiler Name, nur fürs Store-Repo selbst) — damit der
  Bootstrap-Link der Landingpage `…/releases/latest/download/selfstore.apk` immer
  funktioniert (zum Weitergeben/QR).

> `latest/download/<name>` funktioniert nur mit **stabilem** Dateinamen. Versionierte
> Dateien immer per `releases/download/<tag>/<datei>` verlinken.

## Icons

Quadratische PNGs (512×512, dunkler Self-Hintergrund) unter `icons/`. Erzeugt aus
dem Brand-Kit: `brand-kit/logo/make-apk-icons.py`.
