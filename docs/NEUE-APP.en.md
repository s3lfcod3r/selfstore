# Add a new app to SelfStore

> 🇩🇪 **Deutsche Fassung:** [NEUE-APP.md](NEUE-APP.md)

> For **updates of existing apps** there is nothing to do: build the APK, upload a
> GitHub release, and the auto-sync pulls version/APK/SHA-256 automatically (see
> `tools/sync_catalog.py`). This guide is only for a **brand-new app**.

A new app needs four one-time steps (step 3 gained one more item in v1.5.0: the
signature pin). After that it runs fully automatically.

## 1. Create the catalog entry

The auto-sync cannot derive name/description/icon/package id from a release — those
metadata go into `catalog.json` once. Safest via the helper script (avoids JSON
mistakes): write a small JSON file with the app block and merge it.

`new-app.json` (example):
```json
{
  "id": "com.example.app",
  "source": "s3lfcod3r/example",
  "name": "Example",
  "platforms": ["phone"],
  "tagline": "Short description",
  "description": "Longer description.",
  "icon": "icons/example.png",
  "category": "Tools",
  "author": "SelfCoder"
}
```
Then:
```bash
python tools/add_app.py new-app.json
```
The script checks required fields (`id`, `name`, `source`), rejects duplicate ids and
writes `catalog.json` cleanly (UTF-8). `versionName`/`versionCode`/`apk`/`sha256` are
deliberately NOT set — the auto-sync fills them in from the latest release on its first
run.

- **`id` MUST be the real applicationId** (verify with `aapt dump badging <apk>`),
  otherwise update detection will not work.
- Universal APK → leave the `apk` field to the sync. Native ABIs → use an `abis` block
  instead (`armeabi-v7a`/`arm64-v8a`, see `_note` in catalog.json).

## 2. Add the icon

Put the PNG referenced in `icon` into `icons/`. The landing page and the app load it
from there.

## 3. Register the package id in the SelfStore app (+ rebuild SelfStore)

For the store to detect "installed / update available" correctly, the app's package id
must be listed in the SelfStore app's manifest `<queries>`. (Without it the store always
shows "Install".) `QUERY_ALL_PACKAGES` would be the alternative but triggers Play
Protect — hence the deliberately narrow `<queries>` list.

1. In `<selfstore-app>/app/src/main/AndroidManifest.xml`, add under `<queries>`:
   `<package android:name="com.example.app" />`
2. **Add the signature fingerprint to `SignerPins.kt`** (since v1.5.0). Without an entry
   the store still installs the app, but unpinned — it is then protected only by package
   name and the catalog's SHA-256. Get the fingerprint from the release APK:
   ```bash
   apksigner verify --print-certs <App>-v1.0.0.apk | grep "SHA-256 digest"
   ```
   Add the value (no spaces, lowercase) to `PINS` in
   `<selfstore-app>/app/src/main/java/com/selfstore/app/SignerPins.kt`:
   `"com.example.app" to "<fingerprint>",`
   > The value belongs **in the app**, not in `catalog.json` — otherwise a tampered
   > catalog could simply change the expected fingerprint along with everything else.
3. Bump versionCode/versionName of the SelfStore app and build a release (build with
   `gradle --no-daemon :app:assembleRelease`, sign with the SelfStore release key).
4. Upload the new SelfStore release → the catalog picks up the new SelfStore version by
   itself.

## 4. Instant trigger in the new app repo

So the new app syncs immediately on every release:

1. Copy `.github/workflows/notify-selfstore.yml` into the new app repo (identical to the
   other app repos: `on: release: [published]` → curl to the `workflow_dispatch`
   endpoint of `s3lfcod3r/selfstore`).
2. Set the secret:
   ```bash
   gh secret set SELFSTORE_SYNC_TOKEN -R s3lfcod3r/<new-repo>
   # value = fine-grained PAT with Actions:write on s3lfcod3r/selfstore ONLY
   ```

## Done

From now on the new app behaves like all the others: **upload a release → the store
updates itself** (instantly via the trigger, at the latest through the 15-minute cron).
