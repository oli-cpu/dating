const app = document.getElementById('app');
const STORAGE_KEY = 'brainrot-matches-v2';

// Öffentliche, kostenlose Meme-API (kein Key nötig): https://github.com/D3vd/Meme_Api
const MEME_API_BASE = 'https://meme-api.com/gimme';
const SUBREDDITS = ['memes', 'dankmemes', 'wholesomememes', 'meirl', 'ProgrammerHumor'];
const BATCH_SIZE = 15;

let deck = [];
let deckIndex = 0;
let loadState = 'idle'; // idle | loading | error

function getMatches() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (e) { return []; }
}
function saveMatches(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

async function fetchMemeBatch() {
  const sub = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
  const res = await fetch(`${MEME_API_BASE}/${sub}/${BATCH_SIZE}`);
  if (!res.ok) throw new Error('API antwortete mit ' + res.status);
  const data = await res.json();
  const memes = data.memes || (data.url ? [data] : []);
  return memes
    .filter(m => !m.nsfw && !m.spoiler && m.url)
    .map(m => ({
      title: m.title,
      url: m.url,
      subreddit: m.subreddit,
      postLink: m.postLink,
      profile: generateProfile()
    }));
}

async function ensureDeck() {
  if (deckIndex < deck.length) return;
  loadState = 'loading';
  renderLoadingCard();
  try {
    const batch = await fetchMemeBatch();
    if (!batch.length) throw new Error('Keine passenden Memes gefunden.');
    deck = deck.concat(batch);
    loadState = 'idle';
    drawCard();
  } catch (e) {
    loadState = 'error';
    renderErrorCard(e.message);
  }
}

function render() {
  app.innerHTML = `
    <section class="hero">
      <div class="kicker">unbezahlte werbung für unbezahlbaren nonsens</div>
      <h1>Echte Memes. <span>Erfundene</span> Menschen.</h1>
      <p>Jedes Profil ist ein live von Reddit geholtes Meme-Bild — mit einem zufällig generierten Fake-Menschen drangeklebt. Namen, Alter und Hobbys sind komplett ausgedacht.</p>
      <div class="stats">
        <div class="stat"><div class="num" id="matchCount">${getMatches().length}</div><div class="label">Deine Matches</div></div>
        <div class="stat"><div class="num">${SUBREDDITS.length}</div><div class="label">Meme-Quellen</div></div>
        <div class="stat"><div class="num">∞</div><div class="label">Mögliche Kombinationen</div></div>
      </div>
    </section>

    <section class="swipe-section">
      <div class="deck" id="deck"></div>
      <div class="swipe-actions" id="actions"></div>
    </section>

    <section class="matches-section">
      <h2>Deine Matches</h2>
      <div id="matchesArea"></div>
    </section>

    <p class="disclaimer">Bilder werden live von öffentlichen Reddit-Feeds geladen (über meme-api.com) — Inhalt und Qualität variieren von Ladung zu Ladung. Profile (Name/Alter/Hobbys) sind zu 100% erfunden und haben nichts mit dem im Bild gezeigten Meme-Ersteller zu tun.</p>
  `;
  drawMatches();
  ensureDeck();
}

function renderLoadingCard() {
  const deckEl = document.getElementById('deck');
  const actionsEl = document.getElementById('actions');
  if (!deckEl) return;
  deckEl.innerHTML = `<div class="loading-state"><h3>Lade frisches Meme…</h3><p>Einen Moment.</p></div>`;
  actionsEl.innerHTML = '';
}

function renderErrorCard(msg) {
  const deckEl = document.getElementById('deck');
  const actionsEl = document.getElementById('actions');
  if (!deckEl) return;
  deckEl.innerHTML = `
    <div class="error-state">
      <h3>Konnte kein Meme laden</h3>
      <p>${msg}</p>
      <button id="retryBtn">Nochmal versuchen</button>
    </div>`;
  actionsEl.innerHTML = '';
  document.getElementById('retryBtn').onclick = () => ensureDeck();
}

function drawCard() {
  const deckEl = document.getElementById('deck');
  const actionsEl = document.getElementById('actions');
  if (!deckEl) return;
  const item = deck[deckIndex];
  if (!item) { ensureDeck(); return; }
  const p = item.profile;

  deckEl.innerHTML = `
    <div class="card">
      <div class="avatar-area">
        <img src="${item.url}" alt="Meme-Bild" loading="lazy" />
        <div class="source-badge">r/${item.subreddit}</div>
      </div>
      <div class="info">
        <h3>${p.name}, ${p.age}</h3>
        <div class="meta">Alias: „${escHtml(item.title)}"</div>
        <div class="tagline">"${p.tagline}"</div>
        <p class="bio">${p.bio}</p>
        <div class="tags">
          ${p.hobbies.map(h => `<span class="tag">${escHtml(h)}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
  actionsEl.innerHTML = `
    <button class="round-btn" id="passBtn" aria-label="Nein">✕</button>
    <button class="round-btn like" id="likeBtn" aria-label="Ja">❤</button>
  `;
  document.getElementById('passBtn').onclick = () => { deckIndex++; drawCard(); };
  document.getElementById('likeBtn').onclick = () => {
    const matches = getMatches();
    matches.push({ name: p.name, age: p.age, url: item.url, hobbies: p.hobbies });
    saveMatches(matches);
    showToast(`Es ist ein Match mit ${p.name}! 🎉`);
    drawMatches();
    const countEl = document.getElementById('matchCount');
    if (countEl) countEl.textContent = matches.length;
    deckIndex++;
    drawCard();
  };
}

function drawMatches() {
  const area = document.getElementById('matchesArea');
  if (!area) return;
  const matches = getMatches();
  if (!matches.length) {
    area.innerHTML = `<p class="matches-empty">Noch keine Matches. Swipe rechts (❤) bei jemandem, der dein Herz aus Bits und Bytes berührt.</p>`;
    return;
  }
  area.innerHTML = `<div class="matches-grid">
    ${matches.slice().reverse().map(m => `
      <div class="match-card">
        <img class="thumb" src="${m.url}" alt="" loading="lazy" />
        <div class="name">${escHtml(m.name)}, ${m.age}</div>
      </div>
    `).join('')}
  </div>`;
}

function showToast(text) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function escHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

render();
