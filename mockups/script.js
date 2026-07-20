// Navigation entre écrans
document.querySelectorAll('[data-goto]').forEach(el => {
  el.addEventListener('click', () => goTo(el.dataset.goto));
});
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => goTo(el.dataset.target));
});

function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.target === id));
}

// Données communes
const stepIcons = { image: 'ti-photo', 'dubbing-video': 'ti-movie', time: 'ti-clock', 'battle-royal': 'ti-shield' };
const stepLabels = { image: 'Image', 'dubbing-video': 'Vidéo de doublage', time: 'Time', 'battle-royal': 'Battle Royal' };

const workflows = [
  { name: 'Remise des diplômes', color: '#378ADD', updated: 'il y a 2h' },
  { name: 'Gala annuel', color: '#D85A30', updated: 'hier' },
  { name: "Soirée d'intégration", color: '#1D9E75', updated: 'il y a 3 jours' },
  { name: 'Conférence rentrée', color: '#7F77DD', updated: 'il y a 1 semaine' },
  { name: 'Journée portes ouvertes', color: '#BA7517', updated: 'il y a 2 semaines' },
  { name: 'Cérémonie de clôture', color: '#D4537E', updated: 'il y a 1 mois' }
];

function workflowCard(w) {
  const card = document.createElement('div');
  card.className = 'workflow-card';
  card.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
      <div class="color-chip" style="background:${w.color};"></div>
      <p style="font-size:13px; font-weight:500; margin:0; flex:1;">${w.name}</p>
    </div>
    <p style="font-size:11px; color:var(--text-muted); margin:0 0 10px;">Modifié ${w.updated}</p>
    <div style="display:flex; gap:6px;">
      <button class="btn btn-sm" style="flex:1;" aria-label="Démarrer"><i class="ti ti-player-play"></i></button>
      <button class="btn btn-sm" style="flex:1;" aria-label="Modifier"><i class="ti ti-edit"></i></button>
      <button class="btn btn-sm" style="flex:1;" aria-label="Supprimer"><i class="ti ti-trash" style="color:var(--danger-dark);"></i></button>
    </div>`;
  card.querySelector('[aria-label="Démarrer"]').onclick = () => { startRegieSession(w.name); goTo('regie'); };
  return card;
}

document.getElementById('full-workflows').append(...workflows.map(workflowCard));

// Écran : régie live — état vide (aucune session en cours), liste des sessions à démarrer
function regieSessionCard(w) {
  const card = document.createElement('div');
  card.className = 'workflow-card';
  card.innerHTML = `
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
      <div class="color-chip" style="background:${w.color};"></div>
      <p style="font-size:13px; font-weight:500; margin:0; flex:1;">${w.name}</p>
    </div>
    <p style="font-size:11px; color:var(--text-muted); margin:0 0 10px;">Modifié ${w.updated}</p>
    <button class="btn btn-accent" style="width:100%;"><i class="ti ti-player-play"></i>Démarrer</button>`;
  card.querySelector('button').onclick = () => startRegieSession(w.name);
  return card;
}
document.getElementById('regie-session-list').append(...workflows.map(regieSessionCard));

// Tags dans le menu : icône écran quand une session tourne, icône musique quand une musique joue
function updateNavTags() {
  const sessionActive = document.getElementById('regie-live').style.display !== 'none';
  document.getElementById('nav-tag-session').style.display = sessionActive ? 'inline-flex' : 'none';
  document.getElementById('nav-tag-music').style.display = regieAudios.length > 0 ? 'inline-flex' : 'none';
}

function startRegieSession(name) {
  document.getElementById('regie-live-name').textContent = name;
  document.getElementById('regie-empty').style.display = 'none';
  document.getElementById('regie-live').style.display = 'block';
  renderRegieTabs();
  renderRegieController();
  updateNavTags();
}

function endRegieSession() {
  document.getElementById('regie-live').style.display = 'none';
  document.getElementById('regie-empty').style.display = 'block';
  updateNavTags();
}
document.getElementById('regie-end-btn').onclick = endRegieSession;

// Réduire la partie "Session" (utile pour un spectacle qui ne fait tourner que de la musique)
let regieSessionCollapsed = false;
document.getElementById('regie-session-toggle').onclick = () => {
  regieSessionCollapsed = !regieSessionCollapsed;
  document.getElementById('regie-session-content').style.display = regieSessionCollapsed ? 'none' : 'block';
  document.getElementById('regie-session-toggle').innerHTML = `<i class="ti ti-chevron-${regieSessionCollapsed ? 'down' : 'up'}"></i>`;
};

// Écran : création de session (réorganisation par flèches, édition dépliée en place, ajout par type en bas)
let creationSteps = [
  { type: 'image', name: 'Logo établissement', open: false, src: 'logo_etablissement.png' },
  { type: 'dubbing-video', name: 'Discours directeur', open: false, src: 'discours_directeur_v2.mp4', time: '2min', description: 'Le mot du directeur avant la remise des diplômes.' },
  { type: 'time', name: 'Impros musicales', open: false, impro: '3', minutes: '2' },
  { type: 'battle-royal', name: 'Quiz final', open: false, players: ['Alex', 'Sam', 'Jordan'] }
];

function renderCreation() {
  const list = document.getElementById('creation-steps');
  list.innerHTML = '';
  creationSteps.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';
    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.style.cursor = 'default';
    header.innerHTML = `
      <i class="ti ti-grip-vertical" style="color:var(--text-muted); font-size:16px;"></i>
      <span style="font-size:12px; color:var(--text-muted); min-width:18px;">${i + 1}</span>
      <i class="ti ${stepIcons[s.type]} type-icon"></i>
      <span class="step-name">${s.name}</span>
      <span class="step-type-label">${stepLabels[s.type]}</span>
      <button class="btn btn-icon" data-act="up" data-i="${i}" aria-label="Monter"><i class="ti ti-chevron-up"></i></button>
      <button class="btn btn-icon" data-act="down" data-i="${i}" aria-label="Descendre"><i class="ti ti-chevron-down"></i></button>
      <button class="btn btn-icon${s.open ? ' is-active' : ''}" data-act="edit" data-i="${i}" aria-label="Modifier"><i class="ti ti-edit"></i></button>
      <button class="btn btn-icon" data-act="del" data-i="${i}" aria-label="Supprimer"><i class="ti ti-trash" style="color:var(--danger-dark);"></i></button>`;
    item.appendChild(header);
    if (s.open) {
      const body = document.createElement('div');
      body.className = 'accordion-body';
      body.innerHTML = etapeEditor(s);
      item.appendChild(body);
    }
    list.appendChild(item);
  });
  list.querySelectorAll('[data-act]').forEach(b => {
    b.onclick = () => {
      const i = parseInt(b.dataset.i);
      const act = b.dataset.act;
      if (act === 'del') { creationSteps.splice(i, 1); renderCreation(); }
      if (act === 'up' && i > 0) { [creationSteps[i - 1], creationSteps[i]] = [creationSteps[i], creationSteps[i - 1]]; renderCreation(); }
      if (act === 'down' && i < creationSteps.length - 1) { [creationSteps[i + 1], creationSteps[i]] = [creationSteps[i], creationSteps[i + 1]]; renderCreation(); }
      if (act === 'edit') { creationSteps[i].open = !creationSteps[i].open; renderCreation(); }
    };
  });
}

const creationAddNames = { image: 'Nouvelle image', 'dubbing-video': 'Nouveau doublage', time: 'Nouveau time', 'battle-royal': 'Nouveau battle royal' };

function newCreationStep(type) {
  const base = { type, name: creationAddNames[type], open: false };
  if (type === 'image') return { ...base, src: 'fichier.png' };
  if (type === 'dubbing-video') return { ...base, src: 'fichier.mp4', time: '2min', description: '' };
  if (type === 'time') return { ...base, impro: '1', minutes: '2' };
  if (type === 'battle-royal') return { ...base, players: [] };
}

const addButtonsEl = document.getElementById('creation-add-buttons');
Object.keys(stepLabels).forEach(type => {
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm';
  btn.innerHTML = `<i class="ti ${stepIcons[type]}"></i>${stepLabels[type]}`;
  btn.onclick = () => { creationSteps.push(newCreationStep(type)); renderCreation(); };
  addButtonsEl.appendChild(btn);
});

renderCreation();

// Champs d'édition partagés par type d'étape (réutilisés par la page de création)
function fileRow(label, filename) {
  return `<div class="file-row">
    <div class="file-thumb"><i class="ti ti-file"></i></div>
    <button class="btn btn-sm"><i class="ti ti-upload"></i>${label}</button>
    <span style="font-size:12px; color:var(--text-muted);">${filename}</span>
  </div>`;
}

function etapeEditor(s) {
  if (s.type === 'image') return fileRow('Choisir un fichier', s.src);
  if (s.type === 'dubbing-video') return `
    ${fileRow('Choisir un fichier vidéo', s.src)}
    <label class="field-label">Nombre de minutes (exemple : "2min")</label>
    <input type="text" value="${s.time}" style="width:120px; margin-bottom:10px;" />
    <label class="field-label">Description (affichée avant le lancement)</label>
    <textarea rows="2" style="width:100%;">${s.description}</textarea>`;
  if (s.type === 'time') return `
    <label class="field-label">Nombre d'impros</label>
    <input type="number" min="1" value="${s.impro}" style="width:100px; margin-bottom:10px;" />
    <label class="field-label">Nombre de minutes</label>
    <input type="number" min="1" value="${s.minutes}" style="width:100px;" />`;
  if (s.type === 'battle-royal') {
    const rows = s.players.map(p => `
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <input type="text" value="${p}" style="flex:1;" />
        <button class="btn btn-icon" aria-label="Retirer ce joueur"><i class="ti ti-x" style="color:var(--danger-dark);"></i></button>
      </div>`).join('');
    return `<label class="field-label">Joueurs</label>${rows}
      <button class="btn btn-sm" style="margin-top:4px;"><i class="ti ti-plus"></i>Ajouter un joueur</button>`;
  }
}

// Écran : régie live
const regieSteps = [
  { type: 'image', name: 'Logo établissement', state: 'done' },
  { type: 'dubbing-video', name: 'Discours directeur', state: 'done' },
  { type: 'time', name: 'Impros musicales', state: 'current' },
  { type: 'battle-royal', name: 'Quiz final', state: 'todo' }
];
let regieActiveType = 'time';
let timeState = { impro: 1, total: 3, seconds: 95 };
let players = [
  { name: 'Alex', score: 2, enabled: true },
  { name: 'Sam', score: 1, enabled: true },
  { name: 'Jordan', score: 0, enabled: true }
];

const regieStepListEl = document.getElementById('regie-steplist');
regieSteps.forEach(s => {
  const row = document.createElement('div');
  row.className = 'step-row' + (s.state === 'current' ? ' current' : '') + (s.state === 'done' ? ' done' : '');
  row.style.cursor = 'pointer';
  row.innerHTML = `<i class="ti ${stepIcons[s.type]} type-icon"></i><span class="step-name">${s.name}</span>`;
  row.onclick = () => { regieActiveType = s.type; renderRegieTabs(); renderRegieController(); };
  regieStepListEl.appendChild(row);
});

function renderRegieTabs() {
  const tabsEl = document.getElementById('regie-tabs');
  tabsEl.innerHTML = '';
  Object.keys(stepLabels).forEach(t => {
    const b = document.createElement('button');
    b.className = 'btn btn-sm' + (t === regieActiveType ? ' is-active' : '');
    b.textContent = stepLabels[t];
    b.onclick = () => { regieActiveType = t; renderRegieTabs(); renderRegieController(); };
    tabsEl.appendChild(b);
  });
}

function renderRegieController() {
  const el = document.getElementById('regie-controller');
  if (regieActiveType === 'image') {
    el.innerHTML = `<div class="preview-box">Aperçu image plein écran</div>`;
  }
  if (regieActiveType === 'dubbing-video') {
    el.innerHTML = `
      <div class="preview-box">Lecture vidéo (muet)</div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; color:var(--text-muted);">01:12</span>
        <input type="range" min="0" max="100" value="55" />
        <span style="font-size:12px; color:var(--danger-dark);">00:08 restant</span>
      </div>`;
  }
  if (regieActiveType === 'time') {
    el.innerHTML = `
      <div style="text-align:center; margin-bottom:12px;">
        <p style="font-size:12px; color:var(--text-secondary); margin:0;">Impro ${timeState.impro} / ${timeState.total}</p>
        <p class="time-display">${String(Math.floor(timeState.seconds / 60)).padStart(2, '0')}:${String(timeState.seconds % 60).padStart(2, '0')}</p>
      </div>
      <div style="display:flex; align-items:center; justify-content:center; gap:12px;">
        <button class="btn btn-icon" id="impro-minus" aria-label="Impro précédente"><i class="ti ti-minus"></i></button>
        <span style="font-size:12px; color:var(--text-muted);">Naviguer entre impros</span>
        <button class="btn btn-icon" id="impro-plus" aria-label="Impro suivante"><i class="ti ti-plus"></i></button>
      </div>`;
    document.getElementById('impro-minus').onclick = () => { if (timeState.impro > 1) { timeState.impro--; renderRegieController(); } };
    document.getElementById('impro-plus').onclick = () => { if (timeState.impro < timeState.total) { timeState.impro++; renderRegieController(); } };
  }
  if (regieActiveType === 'battle-royal') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    el.innerHTML = sorted.map(p => {
      const i = players.indexOf(p);
      return `<div class="player-row${!p.enabled ? ' disabled' : ''}">
        <span style="flex:1; font-size:14px;">${p.name}</span>
        <span style="font-size:14px; font-weight:500; min-width:20px; text-align:center;">${p.score}</span>
        <button class="btn btn-icon" data-i="${i}" data-act="minus" aria-label="Diminuer le score"><i class="ti ti-minus"></i></button>
        <button class="btn btn-icon" data-i="${i}" data-act="plus" aria-label="Augmenter le score"><i class="ti ti-plus"></i></button>
        <button class="btn btn-icon" data-i="${i}" data-act="toggle" aria-label="${p.enabled ? 'Retirer' : 'Réactiver'} le joueur"><i class="ti ti-${p.enabled ? 'trash' : 'recycle'}"></i></button>
      </div>`;
    }).join('');
    el.querySelectorAll('[data-act]').forEach(b => {
      b.onclick = () => {
        const i = parseInt(b.dataset.i);
        if (b.dataset.act === 'plus') players[i].score++;
        if (b.dataset.act === 'minus') players[i].score--;
        if (b.dataset.act === 'toggle') players[i].enabled = !players[i].enabled;
        renderRegieController();
      };
    });
  }
}
renderRegieTabs();
renderRegieController();

let regieAudios = [
  { name: 'Pomp and circumstance', color: '#378ADD' },
  { name: 'Applaudissements', color: '#D85A30' }
];

function renderRegieAudios() {
  const el = document.getElementById('regie-audios');
  if (regieAudios.length === 0) {
    el.innerHTML = `<p style="font-size:12px; color:var(--text-muted); margin:0;">Aucune musique en cours.</p>`;
    return;
  }
  el.innerHTML = regieAudios.map(a => `
    <div class="audio-row">
      <span class="dot" style="background:${a.color};"></span>
      <span style="flex:1;">${a.name}</span>
      <button class="btn btn-icon" data-name="${a.name}" aria-label="Arrêter"><i class="ti ti-player-stop"></i></button>
    </div>`).join('');
  el.querySelectorAll('[data-name]').forEach(b => {
    b.onclick = () => { regieAudios = regieAudios.filter(a => a.name !== b.dataset.name); renderRegieAudios(); updateNavTags(); };
  });
}
renderRegieAudios();

// Bibliothèque de musique : liste à plat avec tags (bruitage, musique, disco)
const trackTags = ['Musique', 'Bruitage', 'Disco'];
let tracks = [
  { id: 't1', name: 'Pomp and circumstance', tag: 'Musique', color: '#378ADD' },
  { id: 't2', name: 'Applaudissements', tag: 'Bruitage', color: '#D4537E' },
  { id: 't3', name: 'Silence tendu', tag: 'Bruitage', color: '#7F77DD' },
  { id: 't4', name: 'Entrée solennelle', tag: 'Musique', color: '#BA7517' },
  { id: 't5', name: 'Célébration', tag: 'Disco', color: '#639922' },
  { id: 't6', name: 'Final disco', tag: 'Disco', color: '#D85A30' }
];
let musiqueActiveTag = 'Tous';

function renderMusiqueTags() {
  const el = document.getElementById('musique-tags');
  el.innerHTML = '';
  ['Tous', ...trackTags].forEach(t => {
    const b = document.createElement('button');
    b.className = 'btn btn-sm' + (t === musiqueActiveTag ? ' is-active' : '');
    b.textContent = t;
    b.onclick = () => { musiqueActiveTag = t; renderMusiqueTags(); renderMusiqueTracks(); };
    el.appendChild(b);
  });
}

function renderMusiqueTracks() {
  const el = document.getElementById('musique-tracks');
  el.innerHTML = '';
  tracks.filter(t => musiqueActiveTag === 'Tous' || t.tag === musiqueActiveTag).forEach(t => {
    const row = document.createElement('div');
    row.className = 'step-row';
    row.innerHTML = `
      <span class="dot" style="background:${t.color};"></span>
      <span class="step-name">${t.name}</span>
      <span class="pill">${t.tag}</span>
      <button class="btn btn-icon" data-act="edit" data-id="${t.id}" aria-label="Modifier"><i class="ti ti-edit"></i></button>
      <button class="btn btn-icon" data-act="del" data-id="${t.id}" aria-label="Supprimer"><i class="ti ti-trash" style="color:var(--danger-dark);"></i></button>`;
    el.appendChild(row);
  });
  el.querySelectorAll('[data-act]').forEach(b => {
    b.onclick = () => {
      const id = b.dataset.id;
      if (b.dataset.act === 'del') { tracks = tracks.filter(t => t.id !== id); renderMusiqueTracks(); renderRegieMusicList(); }
      if (b.dataset.act === 'edit') { alert('Modifier la musique ' + tracks.find(t => t.id === id).name); }
    };
  });
}

const addTrackBtn = document.getElementById('add-track-btn');
const addTrackForm = document.getElementById('add-track-form');
addTrackBtn.onclick = () => { addTrackForm.style.display = addTrackForm.style.display === 'none' ? 'block' : 'none'; };
document.getElementById('cancel-track-btn').onclick = () => { addTrackForm.style.display = 'none'; };
document.getElementById('save-track-btn').onclick = () => {
  const nameInput = document.getElementById('new-track-name');
  const tagSelect = document.getElementById('new-track-tag');
  const palette = ['#378ADD', '#D85A30', '#1D9E75', '#7F77DD', '#D4537E', '#BA7517'];
  tracks.push({
    id: 't' + Date.now(),
    name: nameInput.value || 'Nouvelle musique',
    tag: tagSelect.value,
    color: palette[Math.floor(Math.random() * palette.length)]
  });
  nameInput.value = '';
  addTrackForm.style.display = 'none';
  renderMusiqueTracks();
  renderRegieMusicList();
};

renderMusiqueTags();
renderMusiqueTracks();

// Régie live : bloc "démarrer une musique" filtrable par tag
let regieMusicActiveTag = 'Tous';

function renderRegieMusicTags() {
  const el = document.getElementById('regie-music-tags');
  el.innerHTML = '';
  ['Tous', ...trackTags].forEach(t => {
    const b = document.createElement('button');
    b.className = 'btn btn-sm' + (t === regieMusicActiveTag ? ' is-active' : '');
    b.textContent = t;
    b.onclick = () => { regieMusicActiveTag = t; renderRegieMusicTags(); renderRegieMusicList(); };
    el.appendChild(b);
  });
}

function renderRegieMusicList() {
  const el = document.getElementById('regie-music-list');
  el.innerHTML = '';
  tracks.filter(t => regieMusicActiveTag === 'Tous' || t.tag === regieMusicActiveTag).forEach(t => {
    const row = document.createElement('div');
    row.className = 'step-row';
    const isPlaying = regieAudios.some(a => a.name === t.name);
    row.innerHTML = `
      <span class="dot" style="background:${t.color};"></span>
      <span class="step-name">${t.name}</span>
      <span class="pill">${t.tag}</span>
      <button class="btn btn-sm" data-id="${t.id}" ${isPlaying ? 'disabled' : ''}><i class="ti ti-player-play"></i>${isPlaying ? 'En cours' : 'Démarrer'}</button>`;
    el.appendChild(row);
  });
  el.querySelectorAll('button[data-id]').forEach(b => {
    b.onclick = () => {
      const t = tracks.find(x => x.id === b.dataset.id);
      if (!regieAudios.some(a => a.name === t.name)) {
        regieAudios.push({ name: t.name, color: t.color });
        renderRegieAudios();
        renderRegieMusicList();
        updateNavTags();
      }
    };
  });
}
renderRegieMusicTags();
renderRegieMusicList();
updateNavTags();
