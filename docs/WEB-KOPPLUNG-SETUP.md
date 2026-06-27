# Web-Kopplung einrichten (Cloudflare Worker)

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

## 6. Adresse eintragen lassen
Schick mir die **Worker-Adresse** (die `…workers.dev`). Ich trage sie als
`pairEndpoint` in die `catalog.json` ein – damit kennen **App und Webseite** den
Dienst automatisch (eine einzige Stelle). Danach baue ich die
„Per-Web-hinzufügen"-Funktion in SelfStore fertig.

## Optional: schöne Adresse
Statt `…workers.dev` kannst du dem Worker später eine eigene Route geben (z. B.
`pair.selfcoder.de`) – falls du das willst, sag Bescheid, dann zeige ich dir die
zwei Klicks. Für den Start reicht die `workers.dev`-Adresse völlig.

## Sicherheit
- Daten (Link + Passwort) liegen **max. 10 Minuten** im Briefkasten und werden bei
  der Abholung durch den Fernseher **sofort gelöscht** (einmalig).
- Übertragung nur über **HTTPS**.
- Zusätzlich zeigt SelfStore die empfangene Quelle vor dem Anlegen **zur Bestätigung**.
