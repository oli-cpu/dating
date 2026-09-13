// Wortlisten für den Zufalls-Profilgenerator. Rein clientseitig, keine echten Personen.

const FIRST_NAMES = [
  "Hans", "Ueli", "Vreni", "Doris", "Kurt", "Ruedi", "Silvia", "Beat",
  "Verena", "Fritz", "Trudi", "Werner", "Heidi", "Res", "Marlise", "Toni",
  "Erika", "Walter", "Rosmarie", "Alfred", "Brigitte", "Hansueli", "Elsbeth",
  "Norbert", "Gertrud", "Manfred", "Ottilie", "Paul", "Irmgard", "Klaus"
];

const LAST_NAMES = [
  "Rodriguez", "Müller", "Steiner", "Huber", "Meier", "Weber", "Fischer",
  "Zimmermann", "Keller", "Brunner", "Gonzalez", "Baumgartner", "Frei",
  "Suter", "Wyss", "Schneider", "Moreno", "Gasser", "Hartmann", "Kobayashi",
  "Bachmann", "Schmid", "Nowak", "Iversen", "Dubois", "Costa"
];

const HOBBIES = [
  "Paddeln", "Jassen", "Alphorn blasen", "Rasenmähen um 6 Uhr morgens",
  "Fondue-Kritik", "Bratwurst-Grillieren", "Bergwandern mit Stöcken",
  "Tupperware sammeln", "Modelleisenbahn", "Vereinsvorstand spielen",
  "Kaffeekränzchen", "Wandern ohne Ziel", "Schwingen zuschauen",
  "Zwiebelkuchen backen", "Fasnachtsplanung (ganzjährig)", "Znüni optimieren",
  "Briefmarken sortieren", "Nachbars Garten begutachten", "Seilziehen",
  "Käsefondue-Theorie", "Dorfchronik schreiben", "Kegeln", "Minigolf",
  "Skifahren im Kopf", "Vogelhäuschen bauen", "Gartenzwerge umstellen"
];

const CITIES = [
  "Zürich", "Bern", "Basel", "Luzern", "Winterthur", "St. Gallen",
  "Thun", "Chur", "Aarau", "Baden", "Uster", "Zug", "Solothurn",
  "Rapperswil", "Frauenfeld", "Wetzikon", "Schaffhausen"
];

const JOBS = [
  "Selbstständiger Znüni-Berater", "Pensionierter Vollzeit-Optimist",
  "Teilzeit-Philosoph", "Hobby-Meteorologe", "Freischaffender Grübler",
  "Vereinskassier a.D.", "Gelegenheits-Alphornbauer", "Quartier-Legende",
  "Möchtegern-Landwirt", "Hauptberuflicher Skeptiker", "Fondue-Sommelier",
  "Chef de Bureau (Homeoffice, unbezahlt)", "Kummerkasten-Beauftragter"
];

const LOOKING_FOR = ["Beziehung", "Freundschaft Plus", "Chaos auf Zeit", "Das grosse Ganze", "Noch unklar"];

const TAGLINE_TEMPLATES = [
  "Sucht {pronoun} für lange Abende und noch längere Kaffeepausen.",
  "{hobby1} ist mein Leben, {hobby2} meine Leidenschaft.",
  "Verheiratet mit {hobby1}, offen für Neues.",
  "Wer {hobby2} mag, hat schon halb gewonnen.",
  "Bereit für die grosse Liebe — oder zumindest für {hobby1}.",
  "Meine Mutter sagt, ich soll öfter raus. Ich sage: {hobby1} zählt.",
  "Charakterlich gefestigt durch {hobby1} und {hobby2}."
];

const BIO_TEMPLATES = [
  "{name}, {age} Jahre jung. Wohnt seit Ewigkeiten in {city} und ist stolz drauf. Sucht jemanden, der {hobby1} genauso ernst nimmt wie ich.",
  "{age} Jahre Lebenserfahrung, ungefähr die Hälfte davon investiert in {hobby1}. {name} aus {city} freut sich auf dich.",
  "Bekannt im ganzen Quartier von {city} für {hobby1}. {name} ({age}) sucht jemanden mit Sinn für die kleinen Dinge im Leben, wie {hobby2}.",
  "{name}, {age}, geschieden von der Fernbedienung, aber treu zu {hobby1}. Zweite große Liebe: {hobby2}. Lebt in {city}."
];

// Kurze, offensichtlich alberne Chat-Eröffnungen und Antworten — rein zur Show,
// damit sich ein Match wie ein echtes Gespräch anfühlt.
const OPENING_LINES = [
  "Hoi! Bock auf {hobby1} am Wochenende?",
  "Sali, dein Profil hat mich sofort überzeugt. {hobby1}, ernsthaft?",
  "Hey du! Ich hab gehört, {city} ist gerade schön. Kaffee?",
  "Guten Tag. Ich bin bereit für {hobby2}, wenn du es auch bist.",
  "Hoi zäme — Match ist Match. Wollen wir mal {hobby1} ausprobieren?"
];

const REPLY_LINES = [
  "Haha, gerne! Wann passt es dir?",
  "Klingt gut, aber nur wenn du {hobby1} auch magst 😄",
  "Ich bin dabei — solange wir vorher noch Znüni machen.",
  "Ehrlich gesagt hab ich schon Pläne mit {hobby1}, aber danach sicher!",
  "Absolut. {city} wartet auf uns.",
  "Nur wenn du versprichst, nicht über {hobby2} zu lachen."
];

// ---------- Keyword-basierter Antwort-Generator ----------
// Reagiert auf ein paar typische Signale in der Nachricht, statt komplett
// stumpf zufällig zu sein. Läuft komplett lokal, keine echte KI, kein API-Key.
const REPLY_BANKS = {
  greeting: [
    "Hoi zäme! Schön, von dir zu hören.",
    "Sali! Wie läuft dein Tag so?",
    "Hey du! Hab schon auf eine Nachricht gehofft."
  ],
  question: [
    "Gute Frage — ich sag mal: {hobby1}. Und du?",
    "Kommt drauf an, aber tendenziell ja. Warum fragst du?",
    "Hmm, lass mich kurz überlegen... auf jeden Fall!"
  ],
  hobbyMention: [
    "Warte, du kennst dich mit {hobby1} aus? Das entscheidet jetzt alles.",
    "{hobby1} ist bei mir Pflichtprogramm, wusstest du das?",
    "Ok du hast mein Interesse — erzähl mehr davon."
  ],
  plan: [
    "Bin dabei! Sag mir nur wann und wo.",
    "Klingt nach einem Plan. {city}, du und ich?",
    "Perfekt, ich hab sowieso gerade Zeit für {hobby1}."
  ],
  compliment: [
    "Oh, du bringst mich zum Erröten 😳",
    "Das ist jetzt schon der Grund, warum ich geswiped hab.",
    "Charmant. Sehr charmant."
  ],
  laugh: [
    "Haha, du bist lustig, das mag ich.",
    "😂 ok das musste ich mir kurz zweimal durchlesen.",
    "Du bringst mich echt zum Lachen hier."
  ],
  short: [
    "Ok 👍",
    "Verstehe.",
    "Aha, spannend!"
  ],
  default: [
    "Erzähl mir mehr davon.",
    "Interessant! Und sonst so?",
    "Das kann man so stehen lassen, oder magst du noch {hobby2} dazu erwähnen?",
    "Mag ich. Was machst du sonst noch gern?"
  ]
};

function detectCategory(text) {
  const t = text.toLowerCase();
  if (/^(hoi|hallo|hey|sali|servus|grüezi|hi)\b/.test(t)) return 'greeting';
  if (/\?$/.test(t.trim())) return 'question';
  if (/(paddeln|jassen|alphorn|fondue|wandern|kegeln|minigolf|hobby|znüni|garten)/i.test(t)) return 'hobbyMention';
  if (/(treffen|date|kaffee|abend|wochenende|zeit|wann|lust auf)/i.test(t)) return 'plan';
  if (/(schön|hübsch|toll|süss|nett bist du|gefällst)/i.test(t)) return 'compliment';
  if (/(haha|lol|😂|xD|hihi)/i.test(t)) return 'laugh';
  if (t.trim().length <= 4) return 'short';
  return 'default';
}

function generateReply(vars, userText) {
  const category = userText ? detectCategory(userText) : 'default';
  const bank = REPLY_BANKS[category] || REPLY_BANKS.default;
  return fillTemplate(pick(bank), vars);
}

const LAST_ACTIVE_OPTIONS = ["gerade eben", "vor 3 Min.", "vor 20 Min.", "vor 1 Std.", "heute früh"];
function generatePresence() {
  const online = Math.random() < 0.35;
  return { online, lastActiveText: online ? "online" : `zuletzt ${pick(LAST_ACTIVE_OPTIONS)}` };
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function fillTemplate(tpl, vars) {
  return tpl.replace(/{(\w+)}/g, (_, k) => vars[k] ?? '');
}

function generateProfile() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const age = 22 + Math.floor(Math.random() * 55); // 22–76
  const hobby1 = pick(HOBBIES);
  let hobby2 = pick(HOBBIES);
  while (hobby2 === hobby1) hobby2 = pick(HOBBIES);
  const city = pick(CITIES);
  const distanceKm = 1 + Math.floor(Math.random() * 38);
  const job = pick(JOBS);
  const lookingFor = pick(LOOKING_FOR);
  const name = `${first} ${last}`;
  const vars = { name, age, hobby1, hobby2, city };

  const tagline = fillTemplate(pick(TAGLINE_TEMPLATES), { ...vars, pronoun: Math.random() > 0.5 ? 'sie' : 'ihn' });
  const bio = fillTemplate(pick(BIO_TEMPLATES), vars);
  const openingLine = fillTemplate(pick(OPENING_LINES), vars);

  return {
    name, age, city, distanceKm, job, lookingFor,
    hobbies: [hobby1, hobby2],
    tagline, bio, openingLine,
    _vars: vars // für spätere Antwort-Generierung
  };
}

function generateReply(vars) {
  return fillTemplate(pick(REPLY_LINES), vars);
}
