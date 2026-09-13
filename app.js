const app = document.getElementById('app');
const MATCHES_KEY = 'studer-meme-matches-v3';
const MSG_KEY_PREFIX = 'studer-meme-msgs-v3:';

const IMGFLIP_URL = 'https://api.imgflip.com/get_memes';
const MATCH_CHANCE = 0.5;

const ICONS = {
  flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-1-2-1-2 2 1 3 4 3 6a6 6 0 1 1-12 0c0-3 2-5 4-7 0-2 0-3 0-4z"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.6-9.5-9C.8 8.6 2.5 5 6 5c2 0 3.5 1.2 4 2.4C10.5 6.2 12 5 14 5c3.5 0 5.2 3.6 3.5 7-2.5 4.4-9.5 9-9.5 9z"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/></svg>`
};

let templates = [];
let deck = [];
let deckIndex = 0;
let screen = 'discover'; // discover | matches | chat
let activeMatch = null;
let templatesState = 'idle'; // idle | loading | error
let cardBusy = false;
let showInfoModal = false;
let showProfileSheet = false;

function getMatches() {
  try { return JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]'); }
  catch (e) { return []; }
}
function saveMatches(list) { localStorage.setItem(MATCHES_KEY, JSON.stringify(list)); }

function getMsgs(matchId) {
  try { return JSON.parse(localStorage.getItem(MSG_KEY_PREFIX + matchId) || '[]'); }
  catch (e) { return []; }
}
function saveMsgs(matchId, msgs) { localStorage.setItem(MSG_KEY_PREFIX + matchId, JSON.stringify(msgs)); }

function esc(s) {
  return (s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function timeNow() { return new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }); }

async function loadTemplates() {
  templatesState = 'loading';
  render();
  try {
    const res = await fetch(IMGFLIP_URL);
    if (!res.ok) throw new Error('API antwortete mit ' + res.status);
    const data = await res.json();
    if (!data.success) throw new Error('Imgflip meldete einen Fehler.');
    templates = shuffle(data.data.memes.filter(m => m.width && m.height));
    templatesState = 'idle';
    fillDeck();
    render();
  } catch (e) {
    templatesState = 'error';
    render(e.message);
  }
}

function fillDeck() {
  deck = templates.map(t => ({ template: t, profile: generateProfile() }));
  deckIndex = 0;
}

// ---------- RENDER ----------
function render(errorMsg) {
  app.innerHTML = `
    <div class="topbar">
      <div class="brand"><span class="mark">dating<span class="dot">.studer</span></span></div>
      <button class="icon-btn" id="infoBtn" aria-label="Info">${ICONS.info}</button>
    </div>
    <div id="content"></div>
    <div class="tabbar">
      <button data-tab="discover" class="${screen==='discover'?'active':''}">${ICONS.flame}<span>Entdecken</span></button>
      <button data-tab="matches" class="${screen==='matches'?'active':''}">${ICONS.chat}<span>Matches</span>${getMatches().length ? '<span class="tab-dot"></span>' : ''}</button>
    </div>
  `;
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.onclick = () => { screen = el.getAttribute('data-tab'); render(); };
  });
  document.getElementById('infoBtn').onclick = () => { showInfoModal = true; renderModals(); };

  const content = document.getElementById('content');
  if (screen === 'discover') renderDiscover(content, errorMsg);
  else if (screen === 'matches') renderMatches(content);
  else if (screen === 'chat') renderChat(content);

  renderModals();
}

function renderModals() {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  if (!showInfoModal) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal-sheet">
      <h3>Was ist das hier?</h3>
      <p>Die Fotos sind echte, populäre Meme-Vorlagen von <strong>Imgflip</strong>. Name, Alter, Stadt, Job und Bio darunter sind komplett zufällig generiert — es handelt sich um keine echten Personen und keine echten Nachrichten.</p>
      <p>Beim Liken gibt's nur mit <strong>50% Wahrscheinlichkeit</strong> ein Match, genau wie bei einer echten App weisst du vorher nicht, ob es klappt.</p>
      <button id="closeInfo">Verstanden</button>
    </div>
  `;
  backdrop.onclick = (e) => { if (e.target === backdrop) { showInfoModal = false; renderModals(); } };
  document.body.appendChild(backdrop);
  document.getElementById('closeInfo').onclick = () => { showInfoModal = false; renderModals(); };
}

function renderDiscover(content, errorMsg) {
  content.innerHTML = `
    <div class="discover-screen">
      <div class="deck" id="deck"></div>
      <div class="swipe-actions" id="actions"></div>
    </div>
  `;
  const deckEl = document.getElementById('deck');
  const actionsEl = document.getElementById('actions');

  if (templatesState === 'loading') {
    deckEl.innerHTML = `<div class="loading-state"><div class="spinner"></div><h3>Lade Memes…</h3><p>Einen Moment.</p></div>`;
    return;
  }
  if (templatesState === 'error') {
    deckEl.innerHTML = `<div class="error-state"><h3>Konnte Memes nicht laden</h3><p>${esc(errorMsg || '')}</p><button id="retryBtn">Nochmal versuchen</button></div>`;
    document.getElementById('retryBtn').onclick = loadTemplates;
    return;
  }
  drawCard(deckEl, actionsEl);
}

function drawCard(deckEl, actionsEl, entering) {
  cardBusy = false;
  const item = deck[deckIndex];
  if (!item) {
    deckEl.innerHTML = `<div class="empty-state"><h3>Alle durchgeswiped!</h3><p>Du hast jede geladene Meme-Vorlage gesehen.</p><button id="reshuffleBtn">Neu mischen</button></div>`;
    actionsEl.innerHTML = '';
    document.getElementById('reshuffleBtn').onclick = () => { templates = shuffle(templates); fillDeck(); drawCard(deckEl, actionsEl); };
    return;
  }
  const { template, profile } = item;
  actionsEl.innerHTML = `
    <button class="round-btn" id="passBtn" aria-label="Nein">${ICONS.x}</button>
    <button class="round-btn like" id="likeBtn" aria-label="Ja">${ICONS.heart}</button>
  `;
  deckEl.innerHTML = `
    <div class="swipe-card ${entering ? 'enter' : ''}" id="cardEl">
      <div class="photo-wrap">
        <img src="${template.url}" alt="${esc(template.name)}" loading="lazy" />
        <div class="gradient"></div>
        <div class="badge-fake">Fake-Profil</div>
        <div class="badge-source">${esc(template.name)}</div>
        <div class="overlay-info">
          <h3>${esc(profile.name)}, ${profile.age}</h3>
          <div class="sub">
            <span>${esc(profile.city)}</span>
            <span class="dot-sep">${profile.distanceKm} km entfernt</span>
            <span class="dot-sep">${esc(profile.job)}</span>
          </div>
          <div class="tagline">"${esc(profile.tagline)}"</div>
          <div class="tags">
            ${profile.hobbies.map(h => `<span class="tag">${esc(h)}</span>`).join('')}
            <span class="tag">sucht: ${esc(profile.lookingFor)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
  const cardEl = document.getElementById('cardEl');
  if (entering) requestAnimationFrame(() => cardEl.classList.remove('enter'));

  document.getElementById('passBtn').onclick = () => swipe(false, deckEl, actionsEl, cardEl, item);
  document.getElementById('likeBtn').onclick = () => swipe(true, deckEl, actionsEl, cardEl, item);
}

function swipe(liked, deckEl, actionsEl, cardEl, item) {
  if (cardBusy) return;
  cardBusy = true;
  cardEl.classList.add(liked ? 'exit-like' : 'exit-pass');

  if (liked) {
    const isMatch = Math.random() < MATCH_CHANCE;
    if (isMatch) {
      const matches = getMatches();
      const matchId = uid();
      const presence = generatePresence();
      matches.unshift({
        id: matchId,
        name: item.profile.name,
        age: item.profile.age,
        photo: item.template.url,
        templateName: item.template.name,
        vars: item.profile._vars,
        bio: item.profile.bio,
        hobbies: item.profile.hobbies,
        openingLine: item.profile.openingLine,
        online: presence.online,
        lastActiveText: presence.lastActiveText
      });
      saveMatches(matches);
      saveMsgs(matchId, [{ from: 'them', text: item.profile.openingLine, t: timeNow() }]);
      setTimeout(() => showMatchOverlay(matches[0]), 320);
    }
  }

  setTimeout(() => {
    deckIndex++;
    drawCard(deckEl, actionsEl, true);
  }, 320);
}

function showMatchOverlay(match) {
  const overlay = document.createElement('div');
  overlay.className = 'match-overlay';
  overlay.innerHTML = `
    <div class="kicker">ES IST EIN MATCH</div>
    <h2>Du und ${esc(match.name)}</h2>
    <div class="photos">
      <img src="${match.photo}" alt="" />
      <img src="${match.photo}" alt="" style="filter:hue-rotate(40deg);" />
    </div>
    <p>Ihr habt euch beide gemocht — natürlich nur, weil der Zufallsgenerator gerade gut gelaunt war.</p>
    <button class="primary" id="goChat">Nachricht schreiben</button>
    <button class="secondary" id="keepSwiping">Weiter swipen</button>
  `;
  document.body.appendChild(overlay);
  document.getElementById('keepSwiping').onclick = () => overlay.remove();
  document.getElementById('goChat').onclick = () => {
    overlay.remove();
    activeMatch = match;
    screen = 'chat';
    render();
  };
}

function renderMatches(content) {
  const matches = getMatches();
  content.innerHTML = `
    <div class="screen">
      <h2 class="screen-title">Deine Matches</h2>
      <div id="matchList"></div>
    </div>
  `;
  const list = document.getElementById('matchList');
  if (!matches.length) {
    list.innerHTML = `<div class="matches-empty">${ICONS.chat}<p>Noch keine Matches. Geh zu «Entdecken» und finde jemanden — bei 50% Match-Chance kann's ein paar Versuche brauchen.</p></div>`;
    return;
  }
  list.innerHTML = matches.map(m => {
    const msgs = getMsgs(m.id);
    const last = msgs[msgs.length - 1];
    return `
      <div class="match-row" data-match="${m.id}">
        <div class="avatar"><img src="${m.photo}" alt="" />${m.online ? '<span class="online-dot"></span>' : ''}</div>
        <div class="body">
          <div class="name-row"><span class="name">${esc(m.name)}</span><span class="age">${m.age}</span></div>
          <div class="preview">${esc(last ? last.text : '')}</div>
        </div>
      </div>
    `;
  }).join('');
  document.querySelectorAll('[data-match]').forEach(el => {
    el.onclick = () => {
      activeMatch = matches.find(m => m.id === el.getAttribute('data-match'));
      showProfileSheet = false;
      screen = 'chat';
      render();
    };
  });
}

function renderChat(content) {
  const m = activeMatch;
  content.innerHTML = `
    <div class="chat-screen">
      <div class="chat-header">
        <button class="icon-btn" id="backBtn">${ICONS.back}</button>
        <div class="avatar"><img src="${m.photo}" alt="" />${m.online ? '<span class="online-dot"></span>' : ''}</div>
        <div class="id-block" id="headerTapArea" style="cursor:pointer;">
          <h3>${esc(m.name)}, ${m.age}</h3>
          <div class="meta ${m.online ? 'online' : ''}">${m.online ? 'online' : esc(m.lastActiveText)}</div>
        </div>
      </div>
      ${showProfileSheet ? `
        <div class="profile-sheet">
          <p>${esc(m.bio)}</p>
          <div class="tags">${m.hobbies.map(h => `<span class="tag">${esc(h)}</span>`).join('')}</div>
        </div>
      ` : ''}
      <div class="chat-messages" id="msgs"></div>
      <div class="chat-input">
        <input id="msgInput" placeholder="Nachricht schreiben…" />
        <button id="sendBtn">${ICONS.send}</button>
      </div>
    </div>
  `;
  document.getElementById('backBtn').onclick = () => { screen = 'matches'; render(); };
  document.getElementById('headerTapArea').onclick = () => { showProfileSheet = !showProfileSheet; renderChat(content); };

  function draw() {
    const msgsEl = document.getElementById('msgs');
    if (!msgsEl) return;
    const msgs = getMsgs(m.id);
    msgsEl.innerHTML = msgs.map(x => `
      <div class="bubble-row ${x.from === 'me' ? 'mine' : 'theirs'}">
        <div class="bubble">${esc(x.text)}</div>
        <div class="bubble-time">${esc(x.t || '')}</div>
      </div>
    `).join('');
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }
  draw();

  const sendBtn = document.getElementById('sendBtn');
  const input = document.getElementById('msgInput');
  sendBtn.onclick = send;
  input.onkeydown = (e) => { if (e.key === 'Enter') send(); };

  function send() {
    const text = input.value.trim();
    if (!text) return;
    const msgs = getMsgs(m.id);
    msgs.push({ from: 'me', text, t: timeNow() });
    saveMsgs(m.id, msgs);
    input.value = '';
    sendBtn.disabled = true;
    draw();

    const msgsEl = document.getElementById('msgs');
    const typing = document.createElement('div');
    typing.className = 'typing-row';
    typing.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    msgsEl.appendChild(typing);
    msgsEl.scrollTop = msgsEl.scrollHeight;

    setTimeout(() => {
      const reply = generateReply(m.vars, text);
      const cur = getMsgs(m.id);
      cur.push({ from: 'them', text: reply, t: timeNow() });
      saveMsgs(m.id, cur);
      sendBtn.disabled = false;
      draw();
    }, 900 + Math.random() * 900);
  }
}

loadTemplates();
