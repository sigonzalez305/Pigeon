// Hi! I am leaving lots of comments so anyone can follow along with the pigeon logic.
// The goal: a simple, friendly, mobile-first game where you send one message a day.

// --- State setup ---
const DEFAULT_STATE = {
  pigeon: {
    name: 'Sky Courier',
    color: 'silver',
    accessory: 'Starter Satchel',
    level: 1,
    xp: 0,
  },
  mileage: 0,
  badges: [],
  messages: [],
  lastMessageDate: null,
  weather: {
    from: { areaCode: '', summary: 'Waiting for forecast…' },
    to: { areaCode: '', summary: 'Waiting for forecast…' },
    impact: 'Check both area codes to see the impact.',
    modifier: 1,
  },
  etaMinutes: 0,
};

// We save the game in localStorage so progress sticks between refreshes.
let state = loadState();

// --- DOM lookups ---
const levelEl = document.getElementById('pigeonLevel');
const xpTextEl = document.getElementById('xpText');
const xpBarEl = document.getElementById('xpBar');
const badgeListEl = document.getElementById('badgeList');
const milesEl = document.getElementById('milesFlown');
const timelineEl = document.getElementById('flightTimeline');
const weatherSummaryEl = document.getElementById('weatherSummary');
const weatherImpactEl = document.getElementById('weatherImpact');
const pigeonNameInput = document.getElementById('pigeonName');
const pigeonColorInput = document.getElementById('pigeonColor');
const pigeonAccessoryLabel = document.getElementById('pigeonAccessoryLabel');
const pigeonBody = document.getElementById('pigeonBody');
const pigeonAccessory = document.getElementById('pigeonAccessory');
const dailyStatusEl = document.getElementById('dailyStatus');
const checkWeatherBtn = document.getElementById('checkWeather');
const form = document.getElementById('messageForm');
const purposeSelect = document.getElementById('purpose');
const messageInput = document.getElementById('message');
const chatWindow = document.getElementById('chatWindow');
const historyListEl = document.getElementById('historyList');
const etaTextEl = document.getElementById('etaText');
const flightIcon = document.getElementById('flightIcon');
const tabButtons = document.querySelectorAll('[data-screen-button]');
const screens = document.querySelectorAll('[data-screen]');

// Phone fields
const fromAreaCodeSelect = document.getElementById('fromAreaCode');
const toAreaCodeSelect = document.getElementById('toAreaCode');
const fromNumberInput = document.getElementById('fromNumber');
const toNumberInput = document.getElementById('toNumber');

// --- Constants for leveling and badges ---
const BADGE_RULES = [
  { id: 'first-flight', label: 'First Flight', test: (s) => s.messages.length >= 1 },
  { id: 'weather-warrior', label: 'Weather Warrior', test: (s) => s.messages.some((m) => m.weatherImpact.includes('Storm')) },
  { id: 'marathon', label: 'Marathon Flyer', test: (s) => s.mileage >= 50 },
];

// Impact modifiers match the copy shown to the player.
const WEATHER_IMPACT = {
  Tailwind: 0.9,
  Clear: 1,
  Drizzle: 1.1,
  Storm: 1.4,
};

const AREA_CODE_OPTIONS = [
  { code: '212', label: '212 — New York, NY' },
  { code: '305', label: '305 — Miami, FL' },
  { code: '310', label: '310 — Los Angeles, CA' },
  { code: '312', label: '312 — Chicago, IL' },
  { code: '415', label: '415 — San Francisco, CA' },
  { code: '480', label: '480 — Phoenix East Valley, AZ' },
  { code: '617', label: '617 — Boston, MA' },
  { code: '702', label: '702 — Las Vegas, NV' },
  { code: '737', label: '737 — Austin, TX' },
  { code: '808', label: '808 — Hawaii' },
];

// --- Local storage helpers ---
function loadState() {
  const cached = localStorage.getItem('pigeon-msg-state');
  if (!cached) return structuredClone(DEFAULT_STATE);
  try {
    const parsed = JSON.parse(cached);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      weather: {
        ...structuredClone(DEFAULT_STATE.weather),
        ...parsed.weather,
        from: { ...structuredClone(DEFAULT_STATE.weather.from), ...(parsed.weather?.from || {}) },
        to: { ...structuredClone(DEFAULT_STATE.weather.to), ...(parsed.weather?.to || {}) },
      },
    };
  } catch (err) {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem('pigeon-msg-state', JSON.stringify(state));
}

// --- Rendering functions ---
function renderStats() {
  levelEl.textContent = state.pigeon.level;
  const nextLevelTarget = state.pigeon.level * 20;
  xpTextEl.textContent = `${state.pigeon.xp} / ${nextLevelTarget} XP`;
  const percent = Math.min(100, Math.round((state.pigeon.xp / nextLevelTarget) * 100));
  xpBarEl.style.width = `${percent}%`;
  milesEl.textContent = state.mileage.toFixed(1);

  // Update pigeon preview colors to match the chosen vibe.
  const colorMap = {
    silver: '#c5d6f4',
    gold: '#ffd166',
    indigo: '#8da2ff',
    rose: '#ffb3c1',
  };
  pigeonBody.style.background = colorMap[state.pigeon.color];
  pigeonAccessory.textContent = pickAccessoryEmoji(state.pigeon.accessory);
  pigeonAccessoryLabel.textContent = state.pigeon.accessory;
  pigeonNameInput.value = state.pigeon.name;
  pigeonColorInput.value = state.pigeon.color;
}

function renderBadges() {
  badgeListEl.innerHTML = '';
  if (!state.badges.length) {
    const empty = document.createElement('span');
    empty.className = 'tiny';
    empty.textContent = 'No badges yet.';
    badgeListEl.appendChild(empty);
    return;
  }

  state.badges.forEach((badge) => {
    const tag = document.createElement('span');
    tag.className = 'badge-tag badge-earned';
    tag.textContent = badge;
    badgeListEl.appendChild(tag);
  });
}

function renderTimeline() {
  timelineEl.innerHTML = '';
  const sorted = [...state.messages].sort((a, b) => b.sentAt - a.sentAt);
  if (!sorted.length) {
    const empty = document.createElement('div');
    empty.className = 'timeline-item';
    empty.textContent = 'No flights yet. Your pigeon is stretching its wings.';
    timelineEl.appendChild(empty);
    return;
  }

  sorted.forEach((msg) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    const etaCopy = msg.status === 'delivered' ? 'Delivered' : `In flight: ETA ${msg.etaMinutes}m`;
    item.innerHTML = `<strong>${msg.from} → ${msg.to}</strong><br>${msg.text}<br><em>${etaCopy} | ${msg.weatherImpact}</em>`;
    timelineEl.appendChild(item);
  });
}

function renderWeather() {
  weatherSummaryEl.textContent = `${state.weather.from.summary} | ${state.weather.to.summary}`;
  weatherImpactEl.textContent = state.weather.impact;
  etaTextEl.textContent = state.etaMinutes
    ? `Estimated delivery: ${state.etaMinutes} minutes.`
    : 'ETA will appear after weather check (1–5 minutes).';

  fromAreaCodeSelect.value = state.weather.from.areaCode;
  toAreaCodeSelect.value = state.weather.to.areaCode;
  toggleWeatherButton();
}

function renderChat() {
  chatWindow.innerHTML = '';
  const sorted = [...state.messages].sort((a, b) => a.sentAt - b.sentAt);
  if (!sorted.length) {
    const empty = document.createElement('div');
    empty.className = 'chat-bubble';
    empty.textContent = 'No chats yet. Customize your pigeon then send a daily note!';
    chatWindow.appendChild(empty);
    return;
  }

  sorted.forEach((msg) => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    const etaCopy = msg.status === 'delivered' ? 'Delivered' : `ETA ${msg.etaMinutes}m`;
    bubble.innerHTML = `
      <div class="route">${msg.from} → ${msg.to}</div>
      <div>${msg.text}</div>
      <div class="meta"><span>${msg.purpose}</span><span>${etaCopy}</span></div>
    `;
    chatWindow.appendChild(bubble);
  });
}

function renderHistory() {
  historyListEl.innerHTML = '';
  const sorted = [...state.messages].sort((a, b) => b.sentAt - a.sentAt);
  if (!sorted.length) {
    const empty = document.createElement('div');
    empty.className = 'history-card';
    empty.textContent = 'No history yet. Your coop will remember each flight here.';
    historyListEl.appendChild(empty);
    return;
  }

  sorted.forEach((msg) => {
    const card = document.createElement('div');
    card.className = 'history-card';
    const date = new Date(msg.sentAt).toLocaleString();
    const etaCopy = msg.status === 'delivered' ? 'Delivered' : `In flight (${msg.etaMinutes}m)`;
    card.innerHTML = `
      <p class="route">${msg.from} → ${msg.to}</p>
      <p>${msg.text}</p>
      <div class="meta"><span>${msg.purpose}</span><span>${etaCopy}</span></div>
      <div class="meta"><span>${date}</span><span>${msg.weatherImpact}</span></div>
    `;
    historyListEl.appendChild(card);
  });
}

function renderEverything() {
  renderStats();
  renderBadges();
  renderTimeline();
  renderWeather();
  renderChat();
  renderHistory();
}

// --- Badge and leveling helpers ---
function checkBadges() {
  const newlyEarned = BADGE_RULES.filter((rule) => rule.test(state) && !state.badges.includes(rule.label))
    .map((rule) => rule.label);
  if (newlyEarned.length) {
    state.badges.push(...newlyEarned);
  }
}

function gainXp(amount) {
  state.pigeon.xp += amount;
  const target = state.pigeon.level * 20;
  if (state.pigeon.xp >= target) {
    state.pigeon.level += 1;
    state.pigeon.xp = state.pigeon.xp - target;
    state.pigeon.accessory = pickNewAccessory(state.pigeon.level);
  }
}

function pickAccessoryEmoji(label) {
  // Matching simple emoji to the accessory text so the preview feels alive.
  if (label.includes('Storm')) return '⛈️';
  if (label.includes('Royal')) return '👑';
  if (label.includes('Scout')) return '🧢';
  return '🎒';
}

function pickNewAccessory(level) {
  if (level >= 5) return 'Royal Cloak';
  if (level >= 3) return 'Storm Runner Scarf';
  return 'Scout Satchel';
}

// --- Message handling ---
function alreadySentToday() {
  const today = new Date().toDateString();
  return state.lastMessageDate === today;
}

function formatPhone(areaCode, number) {
  if (!areaCode && !number) return '';
  return `(${areaCode}) ${number || '•••'}`;
}

function handleSend(event) {
  event.preventDefault();
  if (alreadySentToday()) {
    dailyStatusEl.textContent = 'You already sent today. Come back tomorrow!';
    return;
  }

  const msg = {
    id: crypto.randomUUID(),
    from: formatPhone(fromAreaCodeSelect.value, fromNumberInput.value.trim()),
    to: formatPhone(toAreaCodeSelect.value, toNumberInput.value.trim()),
    fromAreaCode: fromAreaCodeSelect.value,
    toAreaCode: toAreaCodeSelect.value,
    text: messageInput.value.trim(),
    purpose: purposeSelect.value,
    status: 'in-flight',
    sentAt: Date.now(),
    etaMinutes: state.etaMinutes || calculateEtaMinutes(),
    weatherImpact: state.weather.impact,
  };

  if (!msg.fromAreaCode || !msg.toAreaCode || !msg.text) {
    dailyStatusEl.textContent = 'Please fill out every field so your pigeon knows where to go!';
    return;
  }

  state.lastMessageDate = new Date().toDateString();
  dailyStatusEl.textContent = 'Pigeon launched! Tracking delivery time…';

  state.messages.push(msg);
  const flightDistance = 5 + Math.random() * 10;
  state.mileage += flightDistance;
  gainXp(10);
  checkBadges();
  saveState();
  renderEverything();
  triggerFlightAnimation();

  setTimeout(() => {
    msg.status = 'delivered';
    msg.etaMinutes = 0;
    checkBadges();
    saveState();
    renderEverything();
  }, msg.etaMinutes * 60 * 1000);

  form.reset();
  state.etaMinutes = 0;
  etaTextEl.textContent = 'ETA will appear after weather check (1–5 minutes).';
  toggleWeatherButton();
}

function calculateEtaMinutes(modifier = state.weather.modifier || 1) {
  const baseMinutes = 1 + Math.random() * 4; // 1–5 minutes
  const adjusted = Math.min(5, Math.max(1, Math.round(baseMinutes * modifier)));
  state.etaMinutes = adjusted;
  return adjusted;
}

// --- Weather lookup ---
const OPEN_WEATHER_KEY = 'YOUR_OPENWEATHERMAP_KEY';

async function handleWeatherCheck() {
  const fromArea = fromAreaCodeSelect.value;
  const toArea = toAreaCodeSelect.value;
  if (!fromArea || !toArea) {
    weatherImpactEl.textContent = 'Add both area codes to check the route.';
    return;
  }

  weatherImpactEl.textContent = 'Checking skies…';
  state.weather.from.areaCode = fromArea;
  state.weather.to.areaCode = toArea;

  const [fromForecast, toForecast] = await Promise.all([
    fetchWeatherSummary(fromArea),
    fetchWeatherSummary(toArea),
  ]);

  const fromImpact = pickImpactLabel(fromForecast);
  const toImpact = pickImpactLabel(toForecast);
  const modifier = (WEATHER_IMPACT[fromImpact] + WEATHER_IMPACT[toImpact]) / 2;

  state.weather.from.summary = `${fromImpact} at sender`;
  state.weather.to.summary = `${toImpact} at recipient`;
  state.weather.impact = `${fromImpact} → ${toImpact} conditions influence the ETA.`;
  state.weather.modifier = modifier;
  state.etaMinutes = calculateEtaMinutes(modifier);

  saveState();
  renderWeather();
}

async function fetchWeatherSummary(areaCode) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${areaCode},US&units=metric&appid=${OPEN_WEATHER_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    return data.weather?.[0]?.main || 'Clear';
  } catch (err) {
    // If the API key is missing, we still provide a friendly default so the UI does not break.
    const fallback = ['Tailwind', 'Clear', 'Drizzle', 'Storm'];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
}

function pickImpactLabel(description) {
  if (/thunder|storm/i.test(description)) return 'Storm';
  if (/rain|drizzle/i.test(description)) return 'Drizzle';
  if (/cloud/i.test(description)) return 'Clear';
  if (/wind/i.test(description)) return 'Tailwind';
  return 'Tailwind';
}

// --- Input handlers for customization ---
function handleNameChange(event) {
  state.pigeon.name = event.target.value || 'Sky Courier';
  saveState();
}

function handleColorChange(event) {
  state.pigeon.color = event.target.value;
  saveState();
  renderStats();
}

function toggleWeatherButton() {
  const hasCodes = Boolean(toAreaCodeSelect.value);
  checkWeatherBtn.classList.toggle('hidden', !hasCodes);
}

function switchScreen(target) {
  screens.forEach((section) => {
    const isMatch = section.dataset.screen === target;
    section.toggleAttribute('hidden', !isMatch && section.hasAttribute('data-screen'));
  });
  tabButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.screenButton === target));
}

function triggerFlightAnimation() {
  if (!flightIcon) return;
  const startX = `${Math.random() * 40}px`;
  const startY = `${Math.random() * 80}px`;
  const endX = `${200 + Math.random() * 120}px`;
  const endY = `${-40 - Math.random() * 60}px`;
  flightIcon.style.setProperty('--start-x', startX);
  flightIcon.style.setProperty('--start-y', startY);
  flightIcon.style.setProperty('--end-x', endX);
  flightIcon.style.setProperty('--end-y', endY);

  flightIcon.classList.remove('is-flying');
  void flightIcon.offsetWidth; // restart animation
  flightIcon.classList.add('is-flying');
}

function populateAreaCodes() {
  [fromAreaCodeSelect, toAreaCodeSelect].forEach((select) => {
    select.innerHTML = '<option value="">Choose area code</option>';
    AREA_CODE_OPTIONS.forEach((option) => {
      const opt = document.createElement('option');
      opt.value = option.code;
      opt.textContent = option.label;
      select.appendChild(opt);
    });
  });
}

// --- Startup ---
function init() {
  populateAreaCodes();
  renderEverything();

  form.addEventListener('submit', handleSend);
  checkWeatherBtn.addEventListener('click', handleWeatherCheck);
  pigeonNameInput.addEventListener('input', handleNameChange);
  pigeonColorInput.addEventListener('change', handleColorChange);
  toAreaCodeSelect.addEventListener('change', toggleWeatherButton);

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.screenButton));
  });

  if (alreadySentToday()) {
    dailyStatusEl.textContent = 'You already sent today. Check back tomorrow!';
  }

  switchScreen('coop');
}

init();
