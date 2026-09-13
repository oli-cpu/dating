# dating.studer.website

Rein statische Seite, näher am Look einer echten Dating-App: Vollbild-Foto-Karten im Tinder-Stil, Bottom-Navigation (Entdecken / Matches), und ein Fake-Chat bei jedem Match.

## Was neu ist gegenüber v2

- **Andere Bildquelle:** [Imgflip](https://imgflip.com) statt Reddit-Feed. Liefert die ~100 populärsten, tatsächlich wiedererkennbaren Meme-**Vorlagen** (Drake, Distracted Boyfriend, Woman Yelling at Cat, One Does Not Simply, Two Buttons, ...) statt zufälliger Twitter-Screenshots.
- **Komplett überarbeitetes UI:** echte Vollbild-Fotokarten mit Slide-Animation beim Swipen, eigene SVG-Icons statt Emojis, "Es ist ein Match!"-Vollbildschirm statt kleinem Toast, Online-Status/"zuletzt aktiv", aufklappbares Profil im Chat.
- **50% Match-Chance:** Ein Like führt nicht mehr automatisch zu einem Match — wie in einer echten App weisst du vorher nicht, ob es klappt.
- **Reaktionsfähigerer Chat-Generator:** Antworten werden anhand von Schlüsselwörtern in deiner Nachricht ausgewählt (Begrüssung, Frage, Hobby-Erwähnung, Verabredung, Kompliment, Lachen, kurze Antwort) statt komplett stumpf zufällig zu sein. Läuft rein lokal — keine echte KI, kein API-Key nötig (dazu unten mehr).
- Alle Profile sind weiterhin klar mit einem "Fake-Profil"-Badge markiert.

## Warum keine echte KI im Chat?

Eine Anbindung an eine echte KI (z.B. die Anthropic- oder OpenAI-API) würde einen geheimen API-Key erfordern. Auf einer rein statischen, öffentlichen GitHub-Pages-Seite lässt sich so ein Key nicht sicher verstecken — jeder Besuchende könnte ihn im Quellcode auslesen und auf eure Kosten verwenden. Deshalb läuft der Chat komplett lokal über einen Schlüsselwort-Generator (`generator.js` → `generateReply`). Wer das später erweitern will: dafür bräuchte es einen kleinen eigenen Server, der den echten API-Key geheim hält und nur die Antworten weiterreicht — womit man dann wieder bei einer "richtigen" Backend-Lösung wäre (siehe die Node.js-Version, die wir vorher gebaut haben).

## Wie es funktioniert

- Bild-Quelle: `https://api.imgflip.com/get_memes` — kostenlos, kein API-Key nötig für diesen Endpoint.
- Profilgenerator (`generator.js`): Name, Alter, Stadt, Distanz, Job, Hobbys, Chat-Floskeln — alles zufällig aus festen Wortlisten kombiniert, keine echten Personen.
- Matches & Chatverlauf werden nur lokal im Browser gespeichert (`localStorage`), keine eigene Datenbank.

## Lokal öffnen

```bash
npx serve .
```

Wichtig: über `http://localhost:...` öffnen, nicht die Datei direkt doppelklicken — sonst blockiert der Browser die API-Anfrage an Imgflip.

## Auf GitHub Pages veröffentlichen

1. Repo erstellen, Ordnerinhalt hochladen.
2. **Settings → Pages → Source: Deploy from a branch**, Branch `main`, Ordner `/ (root)`.
3. Fertig — komplett statisch, kein Server, keine Actions nötig.

## Bekannte Grenzen

- Die Imgflip-API liefert dieselben ~100 populären Vorlagen für alle Besucher:innen — es gibt keine Live-"Trend"-Erkennung für brandneue Formate, aber die Liste wird von Imgflip selbst regelmäßig aktualisiert (nach Nutzungshäufigkeit der letzten 30 Tage).
- Kein echter Gesprächspartner im Chat — die Antworten sind zufällige, vorformulierte Sätze.
- Ich konnte die API aus meiner Entwicklungsumgebung heraus nicht selbst live testen (dort ist der Netzwerkzugriff auf fremde Domains gesperrt) — im echten Browser sollte es aber funktionieren, da der Endpoint öffentlich und für clientseitige Nutzung gedacht ist. Falls es doch harkt, sag Bescheid, dann schauen wir uns das gemeinsam an.
