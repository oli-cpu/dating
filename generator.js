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
  "{name}, {age} Jahre jung. Wohnt seit Ewigkeiten im gleichen Dorf und ist stolz drauf. Sucht jemanden, der {hobby1} genauso ernst nimmt wie ich.",
  "{age} Jahre Lebenserfahrung, ungefähr die Hälfte davon investiert in {hobby1}. {name} freut sich auf dich.",
  "Bekannt im ganzen Quartier für {hobby1}. {name} ({age}) sucht jemanden mit Sinn für die kleinen Dinge im Leben, wie {hobby2}.",
  "{name}, {age}, geschieden von der Fernbedienung, aber treu zu {hobby1}. Zweite große Liebe: {hobby2}."
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateProfile() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const age = 22 + Math.floor(Math.random() * 55); // 22–76
  const hobby1 = pick(HOBBIES);
  let hobby2 = pick(HOBBIES);
  while (hobby2 === hobby1) hobby2 = pick(HOBBIES);
  const name = `${first} ${last}`;

  const tagline = pick(TAGLINE_TEMPLATES)
    .replace('{hobby1}', hobby1).replace('{hobby2}', hobby2)
    .replace('{pronoun}', Math.random() > 0.5 ? 'sie' : 'ihn');
  const bio = pick(BIO_TEMPLATES)
    .replace(/{name}/g, name).replace(/{age}/g, age)
    .replace(/{hobby1}/g, hobby1).replace(/{hobby2}/g, hobby2);

  return { name, age, hobbies: [hobby1, hobby2], tagline, bio };
}
