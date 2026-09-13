# Brainrot Match v2 — echte Memes, erfundene Menschen

Rein statische Seite. Bei jedem Swipe wird live ein echtes, aktuelles Meme-Bild von Reddit geladen (über eine öffentliche, kostenlose API) und mit einem komplett zufällig generierten Fake-Profil kombiniert (Name, Alter, Hobbys, Spruch).

Beispiel: ein Tung-Tung-Tung-Sahur-Bild taucht auf, darunter steht z.B. "Hans Rodriguez, 56 — Hobbys: Paddeln, Jassen".

## Wie es funktioniert

- Bild-Quelle: [meme-api.com](https://github.com/D3vd/Meme_Api) — kostenlos, kein API-Key nötig, holt zufällige Beiträge aus r/memes, r/dankmemes, r/wholesomememes, r/meirl, r/ProgrammerHumor (NSFW/Spoiler werden rausgefiltert).
- Profil-Generator (`generator.js`): kombiniert zufällig Vor-/Nachnamen, Alter (22–76) und Hobbys aus festen Wortlisten zu einem Profiltext. Komplett erfunden, hat nichts mit den echten Meme-Urhebern zu tun.
- Kein Login, keine eigene Datenbank — "Matches" werden nur lokal in deinem Browser gespeichert (`localStorage`).

## Wichtig zu wissen

- **Die Bildinhalte variieren** — da echte, aktuelle Reddit-Posts geladen werden, kann der Ton von harmlos bis albern bis (selten, trotz Filter) unpassend reichen. Es gibt keine Kuration durch mich.
- **Abhängigkeit von Drittanbieter-API**: Ist meme-api.com down oder überlastet, zeigt die Seite eine Fehlermeldung mit "Nochmal versuchen"-Button statt eines Bildes.
- Die generierten Namen/Profile sind **reiner Zufall** — jede Ähnlichkeit mit echten Personen ist Zufall.

## Lokal öffnen

```bash
npx serve .
```

Dann die angezeigte Adresse im Browser öffnen (wichtig: über `http://`, nicht direkt als Datei öffnen, sonst blockiert der Browser die API-Anfrage).

## Auf GitHub Pages veröffentlichen

1. Repo erstellen, Ordnerinhalt hochladen.
2. **Settings → Pages → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)`.
3. Fertig — komplett statisch, kein Server, keine Actions nötig. Die Meme-API wird direkt aus dem Browser der Besucher:innen angefragt.

## Anpassen

- Andere Subreddits: `SUBREDDITS`-Array in `app.js` bearbeiten.
- Andere Namen/Hobbys: Listen in `generator.js` erweitern.
- Ladegröße pro Batch: `BATCH_SIZE` in `app.js`.
