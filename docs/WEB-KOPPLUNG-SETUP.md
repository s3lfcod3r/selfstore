# Web-Kopplung einrichten (Cloudflare Worker)

> 🇬🇧 **English version:** [WEB-KOPPLUNG-SETUP.en.md](WEB-KOPPLUNG-SETUP.en.md)

Damit man eine Quelle **am PC/Handy im Browser** eingeben kann und SelfStore sie
auf dem **Fernseher automatisch** übernimmt, braucht es einen winzigen, kostenlosen
„Briefkasten"-Dienst. Den richtest du **einmalig** bei Cloudflare ein – alles im
Browser, keine Kommandozeile. Dauert ca. 10 Minuten.

> Der Code des Dienstes liegt in [`pair/worker.js`](../pair/worker.js).

## 1. Kostenloses Cloudflare-Konto
- Auf **dash.cloudflare.com** registrieren (gratis, keine Kreditkarte nötig).

## 2. KV-Speicher anlegen (der „Briefkasten")
1. Links im Menü: **Storage & Databases → KV**.
2. **Create a namespace** → Name z. B. `selfstore-pair` → **Add**.

## 3. Worker anlegen
1. Links: **Workers & Pages → Create → Create Worker**.
2. Name z. B. `selfstore-pair` → **Deploy** (erstmal mit dem Beispielcode).
3. Danach **Edit code** öffnen, den **gesamten** Inhalt von `pair/worker.js`
   reinkopieren (alten Code ersetzen) → **Deploy**.

## 4. Briefkasten an den Worker binden
1. Beim Worker: **Settings → Bindings** (bzw. **Variables**).
2. **Add binding → KV Namespace**.
3. **Variable name:** `PAIR` (genau so!) · **KV namespace:** `selfstore-pair`.
4. **Save / Deploy**.

## 5. Adresse testen
Der Worker hat jetzt eine Adresse wie:

```
https://selfstore-pair.DEIN-NAME.workers.dev
```

Test: im Browser `https://selfstore-pair.DEIN-NAME.workers.dev/pair/ABCDEF` öffnen.
Es sollte erscheinen:

```json
{"pending":true}
```

Wenn ja → der Briefkasten läuft. ✅

## 6. Adresse eintragen
Die **Worker-Adresse** (die `…workers.dev`) als `pairEndpoint` in die `catalog.json`
eintragen — **App und Webseite** lesen sie von dort (eine einzige Stelle zum
Konfigurieren).

> Ändert sich der Worker-Host, muss er auch in der `connect-src`-Direktive der
> Content-Security-Policy in `pair/index.html` mitgeändert werden.

## Optional: schöne Adresse
Statt `…workers.dev` kannst du dem Worker später eine eigene Route geben (z. B.
`pair.selfcoder.de`). Für den Start reicht die `workers.dev`-Adresse völlig.

## Sicherheit
- **Ende-zu-Ende verschlüsselt (seit SelfStore 1.5.0).** Der Fernseher zeigt einen
  Code in zwei Teilen: `SLOT-SCHLUESSEL` (z. B. `7K2Q9XAB-4H7PNM`). Nur der **Slot**
  geht an den Worker; der **Schlüsselteil** gelangt ausschließlich über die Augen des
  Nutzers in den Browser. Im Briefkasten liegt daher nur Geheimtext (AES-256-GCM,
  Schlüssel via PBKDF2-HMAC-SHA256, 200 000 Runden) — **Worker und Cloudflare können
  Link und Passwort nicht lesen**.
- Der Worker nimmt **keine unverschlüsselten Beiträge mehr an** (`encryption_required`).
- Daten liegen **max. 3 Minuten** (TTL 180 s) im Briefkasten und werden bei der
  Abholung durch den Fernseher **sofort gelöscht** (einmalig).
- Übertragung nur über **HTTPS**; die Pairing-Seite läuft mit strikter CSP und ohne
  Inline-Skript.
- Zusätzlich zeigt SelfStore die empfangene Quelle vor dem Anlegen **zur Bestätigung**.

> ⚠️ **Kompatibilität:** Web-Pairing funktioniert nur mit SelfStore **ab v1.5.0**.
> Ältere Installationen kennen das verschlüsselte Format nicht — dort erst SelfStore
> aktualisieren oder die Quelle direkt am Fernseher eintippen.
>
> ⚠️ **Nach jeder Änderung an `pair/worker.js`:** Der Worker wird **nicht** per
> Git-Push aktualisiert. dash.cloudflare.com → Workers & Pages → `selfstore-pair`
> → **Edit code** → Inhalt von `pair/worker.js` einfügen → **Deploy**.
