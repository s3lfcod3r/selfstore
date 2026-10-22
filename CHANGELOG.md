# 📰 Changelog

Newest version first. Versions of the **SelfStore Android app** (Build = `versionCode`). Builds without their own release note (1.0.10, 1.2.1–1.4.3, 1.4.6, 1.5.1–1.5.7) are not listed.
Neueste Version zuerst. Versionen der **SelfStore-Android-App** (Build = `versionCode`). Builds ohne eigene Änderungsnotiz (1.0.10, 1.2.1–1.4.3, 1.4.6, 1.5.1–1.5.7) sind nicht aufgeführt.

---

## 1.5.8 · Build 40 🔒
- 🇬🇧 The pairing endpoint must be **HTTPS**; APK downloads get **SHA-256-based file names** (no more hash-code collisions); build dependencies updated.
- 🇩🇪 Der Pairing-Endpunkt muss **HTTPS** sein; APK-Downloads bekommen **SHA-256-basierte Dateinamen** (keine hashCode-Kollision mehr); Build-Abhängigkeiten aktualisiert.

## 1.5.0 · Build 32 · August 2026 🔒
- 🇬🇧 Security update: **signature pinning** (fingerprints built into the app), **end-to-end encrypted web pairing** (`SLOT-KEY` code), GitHub Actions pinned to commit SHAs and a strict CSP for the pairing page.
- 🇩🇪 Sicherheitsupdate: **Signatur-Pinning** (Fingerabdrücke fest in der App), **Ende-zu-Ende-verschlüsselte Web-Kopplung** (Code `SLOT-SCHLUESSEL`), GitHub Actions auf Commit-SHA gepinnt und strikte CSP für die Pairing-Seite.

## 1.4.5 · Build 30
- 🇬🇧 **Add via web** now shows a connection status: green = pairing server reachable, red = the box can't reach the server (internet/DNS), with a hint to type the source in directly.
- 🇩🇪 **Per Web hinzufügen** zeigt jetzt einen Verbindungsstatus: grün = Pairing-Server erreichbar, rot = die Box erreicht den Server nicht (Internet/DNS), samt Hinweis, die Quelle direkt einzutippen.

## 1.4.4 · Build 29
- 🇬🇧 TV fix: password and text fields when adding a source can now be typed in reliably — the on-screen keyboard is forced and the field no longer collapses right away.
- 🇩🇪 TV-Fix: Passwort- und Textfelder beim Quelle-Hinzufügen lassen sich jetzt zuverlässig tippen — die Bildschirmtastatur wird erzwungen und das Feld klappt nicht mehr sofort zu.

## 1.2.0 · Build 22
- 🇬🇧 Now detects **SelfWG** (package visibility added): Install / Open / Update is shown correctly.
- 🇩🇪 Erkennt jetzt **SelfWG** (Paket-Sichtbarkeit ergänzt): Installieren / Öffnen / Aktualisieren wird korrekt angezeigt.

## 1.1.9 · Build 21
- 🇬🇧 **Update detection for private-source apps** (e.g. SelfStream Player from NextCloud): the installed version is compared with the catalog. Requires bumping `versionCode` in `catalog.json`.
- 🇩🇪 **Update-Erkennung für Apps aus eigenen Quellen** (z. B. SelfStream Player aus NextCloud): die installierte Version wird mit dem Katalog verglichen. Voraussetzung: `versionCode` in `catalog.json` hochsetzen.

## 1.1.8 · Build 20
- 🇬🇧 **Automatic update notice**: SelfStore checks for new versions in the background about twice a day and notifies you; installing still needs your confirmation.
- 🇩🇪 **Automatischer Update-Hinweis**: SelfStore prüft ca. 2× täglich im Hintergrund auf neue Versionen und schickt eine Benachrichtigung; installiert wird weiterhin nur nach deiner Bestätigung.

## 1.1.7 · Build 19
- 🇬🇧 New: **Add via web** — enter a source in the browser (`store.selfcoder.de/pair`), the TV box picks it up via a code; includes security hardening (8-character code, HTTPS only, confirmation) and stability fixes.
- 🇩🇪 Neu: **Per Web hinzufügen** — Quelle im Browser eingeben (`store.selfcoder.de/pair`), die TV-Box übernimmt sie per Code; inkl. Sicherheits-Härtung (8-Zeichen-Code, HTTPS-Pflicht, Bestätigung) und Stabilitäts-Fixes.

## 1.1.5 · Build 17
- 🇬🇧 Nicer TV input: when adding a source, the on-screen keyboard only opens after pressing OK, not automatically on every field. Phone/tablet unchanged.
- 🇩🇪 TV-Eingabe angenehmer: beim Quelle-Hinzufügen öffnet sich die Bildschirmtastatur erst nach OK, nicht mehr automatisch bei jedem Feld. Handy/Tablet unverändert.

## 1.1.4 · Build 16
- 🇬🇧 Easier to use on a TV: the button selected with the remote gets a clearly visible **focus frame**.
- 🇩🇪 Besser auf dem Fernseher bedienbar: der per Fernbedienung ausgewählte Button bekommt einen deutlich sichtbaren **Fokus-Rahmen**.

## 1.1.3 · Build 15
- 🇬🇧 **Device filter**: on a TV only TV-capable apps are shown (phone-only apps stay hidden there); phone/tablet still show everything.
- 🇩🇪 **Geräte-Filter**: auf dem Fernseher werden nur TV-taugliche Apps angezeigt (reine Handy-Apps bleiben dort ausgeblendet); auf Handy/Tablet weiterhin alles.

## 1.1.2 · Build 14
- 🇬🇧 Custom sources made easy: pasting a **NextCloud share link** (`…/s/…`) is enough — address and user are detected, you only type the password. Each source shows its status/error.
- 🇩🇪 Eigene Quellen jetzt viel einfacher: **NextCloud-Freigabe-Link** (`…/s/…`) einfügen genügt — Adresse und Benutzer werden erkannt, du tippst nur noch das Passwort. Jede Quelle zeigt ihren Status/Fehler an.

## 1.1.1 · Build 13
- 🇬🇧 Header layout fixed (compact icon buttons).
- 🇩🇪 Kopfzeile korrigiert (kompakte Symbol-Buttons).

## 1.1.0 · Build 12
- 🇬🇧 **Custom sources**: add private app repos (e.g. NextCloud/WebDAV) with user and app password; credentials stored encrypted, HTTPS only, automatic update detection.
- 🇩🇪 **Eigene Quellen**: private App-Repos (z. B. NextCloud/WebDAV) mit Benutzer und App-Passwort hinzufügen; Zugangsdaten verschlüsselt gespeichert, nur HTTPS, automatische Update-Erkennung.

## 1.0.9 · Build 10
- 🇬🇧 **SelfPlayer** in the catalog; install detection added for it.
- 🇩🇪 **SelfPlayer** im Katalog; Install-Erkennung dafür ergänzt.

## 1.0.8 · Build 9
- 🇬🇧 **SelfStream Player** in the catalog; install detection added for it.
- 🇩🇪 **SelfStream Player** im Katalog; Install-Erkennung dafür ergänzt.

## 1.0.7 · Build 8
- 🇬🇧 Version/update display no longer cut off.
- 🇩🇪 Versions-/Update-Anzeige nicht mehr abgeschnitten.

## 1.0.6 · Build 7
- 🇬🇧 Fewer **Play Protect** warnings (narrow `<queries>` instead of `QUERY_ALL_PACKAGES`).
- 🇩🇪 Weniger **Play-Protect**-Warnungen (enge `<queries>` statt `QUERY_ALL_PACKAGES`).

## 1.0.5 · Build 6
- 🇬🇧 Own domain `store.selfcoder.de` as catalog source (+ fallback), more robust.
- 🇩🇪 Eigene Domain `store.selfcoder.de` als Katalog-Quelle (+ Fallback), robuster.

## 1.0.4 · Build 5
- 🇬🇧 Nicer, more compact app cards (full-width description, slim footer).
- 🇩🇪 Schönere, kompaktere App-Karten (Beschreibung volle Breite, schlanke Fußzeile).

## 1.0.3 · Build 4
- 🇬🇧 Shield logo in the header + brand font (Orbitron) for the wordmark.
- 🇩🇪 Schild-Logo im Kopf + Marken-Schrift (Orbitron) für den Schriftzug.

## 1.0.2 · Build 3 · June 2026 🔒
- 🇬🇧 Security hardening: only HTTPS/GitHub as source, generic error messages.
- 🇩🇪 Security-Härtung: nur HTTPS/GitHub als Quelle, generische Fehlermeldungen.

## 1.0.1 · Build 2
- 🇬🇧 Branded app icon + banner; installed apps are now detected correctly.
- 🇩🇪 Gebrandetes App-Icon + Banner; erkennt jetzt installierte Apps korrekt.

## 1.0.0 · Build 1
- 🇬🇧 First version.
- 🇩🇪 Erste Version.
