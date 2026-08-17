# Custom sources (private apps via NextCloud)

> 🇩🇪 **Deutsche Fassung:** [EIGENE-QUELLEN.md](EIGENE-QUELLEN.md)

Besides the public catalog, SelfStore can load **private app sources** protected by a
username and password. Ideal for apps that should **not be public**.

## How it works

1. In SelfStore, tap **"Sources"** in the top right.
2. Fill in **"Add source"**:
   - **Name** – anything you like, e.g. "My NextCloud"
   - **Address of catalog.json** – the HTTPS address of your `catalog.json`
   - **Username** + **app password**
3. Save. SelfStore now also loads the apps from that source and detects updates
   automatically via the version number.

The credentials are stored **encrypted** on the device (Android keystore), never in
plaintext. Only **HTTPS** is accepted.

## Setting up NextCloud

### 1. Create an app password (do not use your account password!)

NextCloud → **Settings → Security → New app password**. Give it a name (e.g.
"SelfStore") and copy the password. Advantage: it can be revoked individually at any
time and works with two-factor authentication enabled.

### 2. Create folder and files

Create a folder in NextCloud, e.g. `Apps/SelfStore/`, and put in it:

```
Apps/SelfStore/
├── catalog.json
├── example-0.1.6.apk
├── example.png
└── … (more APKs + icons)
```

### 3. The WebDAV address of catalog.json

The NextCloud scheme is:

```
https://YOUR-NEXTCLOUD/remote.php/dav/files/USER/Apps/SelfStore/catalog.json
```

That exact address goes into SelfStore as the **"Address of catalog.json"**, together
with user + app password — done.

> Relative paths inside `catalog.json` (e.g. `example-0.1.6.apk`) are resolved relative
> to that folder automatically. Just put the APK and icon in the same folder.

## Structure of catalog.json

```json
{
  "store": "My private apps",
  "updated": "2026-06-27",
  "apps": [
    {
      "id": "com.example.player",
      "name": "Example Player",
      "tagline": "Private media player",
      "description": "My personal player, not public.",
      "icon": "example.png",
      "category": "Media",
      "author": "SelfCoder",
      "versionName": "0.1.6",
      "versionCode": 16,
      "changelog": "Multi-day EPG",
      "apk": "example-0.1.6.apk"
    }
  ]
}
```

**Field reference:**

| Field | Required | Meaning |
|-------|----------|---------|
| `id` | yes | package name of the app (e.g. `com.example.player`) |
| `name` | yes | display name |
| `versionName` | yes | visible version, e.g. `0.1.6` |
| `versionCode` | yes | **number** that **increases** with every update |
| `apk` | yes | APK file name (relative) or full HTTPS URL |
| `icon` | no | logo (relative or URL) |
| `tagline`/`description`/`category`/`author`/`changelog` | no | display texts |

For separate 32/64-bit APKs use an `abis` object instead of `apk`:

```json
"abis": {
  "armeabi-v7a": "example-0.1.6-armv7.apk",
  "arm64-v8a":   "example-0.1.6-armv8.apk"
}
```

## Variant: public link with a password (for sharing, without extra accounts)

If you want to **share the folder with others** without creating a NextCloud account for
each of them, share the folder as a **public link with a password**.

1. In NextCloud admin → **Sharing**: "Allow accounts to share via link…" must be **on**.
2. Folder → **Share → Share link** → set a **password** (optionally an **expiry date**),
   turn "Edit" off.
3. Copy the link — it looks like `https://YOUR-NEXTCLOUD/s/<TOKEN>`.

**Easiest since SelfStore 1.1.2:** paste the share link
`https://YOUR-NEXTCLOUD/s/<TOKEN>` **straight into the address field** — the app derives
address and username automatically, so you only type the **link password**. (Ideal for a
TV remote.)

Manually (or on older versions) it looks like this (NextCloud trick: **link token =
username**, **link password = password**):

| Field | Value |
|-------|-------|
| Address | `https://YOUR-NEXTCLOUD/public.php/webdav/catalog.json` |
| Username | the **token** from the link (the part **after `/s/`**) |
| App password | the **link password** |

> The `…/s/<token>` web address does **not** work as a catalog address — it must be the
> `public.php/webdav` path. If a NextCloud version complains, fall back to:
> `https://YOUR-NEXTCLOUD/public.php/dav/files/<TOKEN>/catalog.json`.

**Sharing:** pass on the same link code + link password. **Revoking:** change the link
password or delete the link (applies to everyone). For individually revocable access,
create a separate link per person.

## Publishing an update

1. Put the new APK into the NextCloud folder.
2. In `catalog.json` raise `versionName` **and** `versionCode`, and adjust the `apk`
   file name.
3. Tap **"Refresh"** in SelfStore — the new version appears.

## Note on status detection

Private apps that are not listed in the SelfStore manifest's `<queries>` always show
**"Install"** because of Android's package visibility rules (no "update" badge).
Installing/updating itself works normally — the system installer updates an existing app
when you tap it.

> Signature check: apps without a pin in `SignerPins.kt` are verified against the
> signature of the already installed version (since v1.5.0). So an update to a private
> app must be signed with the same key as the installed one — which Android requires
> anyway.
