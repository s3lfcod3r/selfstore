# Eigene Quellen (private Apps über NextCloud)

> 🇬🇧 **English version:** [EIGENE-QUELLEN.en.md](EIGENE-QUELLEN.en.md)

SelfStore kann neben dem öffentlichen Katalog auch **private App-Quellen**
laden, die mit Benutzername + Passwort geschützt sind. Ideal für Apps, die
**nicht öffentlich** sein sollen.

## So funktioniert es

1. In SelfStore oben rechts auf **„Quellen"** tippen.
2. **„Quelle hinzufügen"** ausfüllen:
   - **Name** – frei wählbar, z. B. „Meine NextCloud"
   - **Adresse der catalog.json** – die HTTPS-Adresse deiner `catalog.json`
   - **Benutzername** + **App-Passwort**
3. Speichern. SelfStore lädt ab sofort auch die Apps dieser Quelle und erkennt
   Updates automatisch über die Versionsnummer.

Die Zugangsdaten werden **verschlüsselt** auf dem Gerät abgelegt
(Android-Keystore), nicht im Klartext. Es wird ausschließlich **HTTPS**
akzeptiert.

## NextCloud einrichten

### 1. App-Passwort erzeugen (nicht das Konto-Passwort verwenden!)

NextCloud → **Einstellungen → Sicherheit → Neues App-Passwort**.
Namen vergeben (z. B. „SelfStore"), Passwort kopieren. Vorteil: jederzeit
einzeln widerrufbar, funktioniert auch bei aktivierter 2-Faktor-Anmeldung.

### 2. Ordner + Dateien anlegen

Lege in NextCloud einen Ordner an, z. B. `Apps/SelfStore/`, und packe hinein:

```
Apps/SelfStore/
├── catalog.json
├── beispiel-1.0.0.apk
├── beispiel.png
└── … (weitere APKs + Icons)
```

### 3. Die WebDAV-Adresse der catalog.json

Das Schema bei NextCloud ist:

```
https://DEINE-NEXTCLOUD/remote.php/dav/files/BENUTZER/Apps/SelfStore/catalog.json
```

Genau diese Adresse trägst du in SelfStore als **„Adresse der catalog.json"**
ein. Benutzer + App-Passwort dazu — fertig.

> Relative Pfade in der `catalog.json` (z. B. `beispiel-1.0.0.apk`) werden
> automatisch relativ zu diesem Ordner aufgelöst. APK + Icon einfach in
> denselben Ordner legen.

## Aufbau der catalog.json

```json
{
  "store": "Meine privaten Apps",
  "updated": "2026-06-27",
  "apps": [
    {
      "id": "com.beispiel.player",
      "name": "Beispiel-Player",
      "tagline": "Privater Medienplayer",
      "description": "Mein persönlicher Player, nicht öffentlich.",
      "icon": "beispiel.png",
      "category": "Medien",
      "author": "SelfCoder",
      "versionName": "1.0.0",
      "versionCode": 10,
      "changelog": "Kleinere Verbesserungen",
      "apk": "beispiel-1.0.0.apk"
    }
  ]
}
```

**Feld-Erklärung:**

| Feld | Pflicht | Bedeutung |
|------|---------|-----------|
| `id` | ja | Paketname der App (z. B. `com.beispiel.player`) |
| `name` | ja | Anzeigename |
| `versionName` | ja | Sichtbare Version, z. B. `1.0.0` |
| `versionCode` | ja | **Zahl**, die bei jedem Update **größer** wird |
| `apk` | ja | Dateiname der APK (relativ) oder volle HTTPS-URL |
| `icon` | nein | Logo (relativ oder URL) |
| `tagline`/`description`/`category`/`author`/`changelog` | nein | Anzeige-Texte |

Für getrennte 32-/64-Bit-APKs statt `apk` ein `abis`-Objekt nutzen:

```json
"abis": {
  "armeabi-v7a": "beispiel-1.0.0-armv7.apk",
  "arm64-v8a":   "beispiel-1.0.0-armv8.apk"
}
```

## Variante: öffentlicher Link mit Passwort (zum Teilen, ohne extra Benutzer)

Wenn du den Ordner **mit anderen teilen** willst, ohne für jeden ein NextCloud-Konto
anzulegen: teile den Ordner als **öffentlichen Link mit Passwort**.

1. In NextCloud Admin → **Freigabe**: „Konten erlauben, Inhalte über Links … zu teilen"
   muss **an** sein.
2. Ordner → **Teilen → Link teilen** → **Passwort** setzen (optional **Ablaufdatum**),
   „Bearbeiten" aus.
3. Den Link kopieren — er sieht so aus: `https://DEINE-NEXTCLOUD/s/<TOKEN>`.

**Ab SelfStore 1.1.2 am einfachsten:** den Freigabe-Link `https://DEINE-NEXTCLOUD/s/<TOKEN>`
**direkt ins Adressfeld einfügen** — die App erkennt Adresse + Benutzer automatisch, du
tippst nur noch das **Link-Passwort**. (Ideal für die TV-Fernbedienung.)

Manuell (oder ältere Version) sieht es so aus (NextCloud-Trick: **Link-Token = Benutzername**,
**Link-Passwort = Passwort**):

| Feld | Wert |
|------|------|
| Adresse | `https://DEINE-NEXTCLOUD/public.php/webdav/catalog.json` |
| Benutzername | der **Token** aus dem Link (Teil **nach `/s/`**) |
| App-Passwort | das **Link-Passwort** |

> Die `…/s/<token>`-Webadresse funktioniert **nicht** als Katalog-Adresse — es muss der
> `public.php/webdav`-Pfad sein. Falls eine NextCloud-Version meckert, Fallback:
> `https://DEINE-NEXTCLOUD/public.php/dav/files/<TOKEN>/catalog.json`.

**Teilen:** denselben Link-Code + Link-Passwort weitergeben. **Widerrufen:** Link-Passwort
ändern oder Link löschen (gilt dann für alle). Für einzeln widerrufbare Zugänge je Person
einen eigenen Link erstellen.

## Ein Update veröffentlichen

1. Neue APK in den NextCloud-Ordner legen.
2. In der `catalog.json` `versionName` **und** `versionCode` hochsetzen, den
   `apk`-Dateinamen anpassen.
3. In SelfStore auf **„Aktualisieren"** — neue Version erscheint.

## Hinweis zur Status-Erkennung

Private Apps, die nicht in der Manifest-`<queries>`-Liste von SelfStore stehen, zeigen
wegen Androids Paket-Sichtbarkeitsregeln immer **„Installieren"** (kein „Update"-Badge).
Das Installieren/Aktualisieren selbst funktioniert normal — der System-Installer
aktualisiert eine bereits vorhandene App beim Antippen.

> **Signaturprüfung:** Apps ohne Pin in `SignerPins.kt` werden gegen die Signatur der
> bereits installierten Version geprüft (seit v1.5.0). Ein Update einer privaten App muss
> also mit demselben Schlüssel signiert sein wie die installierte — was Android ohnehin
> verlangt.
