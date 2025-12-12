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
    areaCode: '',
    summary: 'Waiting for forecast…',
    impact: 'Tailwind boosts speed.',
    modifier: 0.9,
  },
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
const areaCodeInput = document.getElementById('areaCode');
const checkWeatherBtn = document.getElementById('checkWeather');
const form = document.getElementById('messageForm');
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const purposeSelect = document.getElementById('purpose');
const messageInput = document.getElementById('message');

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

// --- Local storage helpers ---
function loadState() {
  const cached = localStorage.getItem('pigeon-msg-state');
  if (!cached) return structuredClone(DEFAULT_STATE);
  try {
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(cached) };
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
    const etaCopy = msg.status === 'delivered' ? 'Delivered' : `In flight: ETA ${msg.eta}s`;
    item.innerHTML = `<strong>${msg.from} → ${msg.to}</strong><br>${msg.text}<br><em>${etaCopy} | ${msg.weatherImpact}</em>`;
    timelineEl.appendChild(item);
  });
}

function renderWeather() {
  weatherSummaryEl.textContent = state.weather.summary;
  weatherImpactEl.textContent = state.weather.impact;
  areaCodeInput.value = state.weather.areaCode;
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

function handleSend(event) {
  event.preventDefault();
  if (alreadySentToday()) {
    dailyStatusEl.textContent = 'You already sent today. Come back tomorrow!';
    return;
  }

  // Collect form values in a friendly way.
  const msg = {
    id: crypto.randomUUID(),
    from: fromInput.value.trim(),
    to: toInput.value.trim(),
    text: messageInput.value.trim(),
    purpose: purposeSelect.value,
    status: 'in-flight',
    sentAt: Date.now(),
    eta: calculateEtaSeconds(),
    weatherImpact: state.weather.summary,
  };

  if (!msg.from || !msg.to || !msg.text) {
    dailyStatusEl.textContent = 'Please fill out every field so your pigeon knows where to go!';
    return;
  }

  // Update the daily limiter right away so players see the rule applied.
  state.lastMessageDate = new Date().toDateString();
  dailyStatusEl.textContent = 'Pigeon launched! Tracking delivery time…';

  // Add to state and paint UI.
  state.messages.push(msg);
  const flightDistance = 5 + Math.random() * 10;
  state.mileage += flightDistance;
  gainXp(10);
  checkBadges();
  saveState();
  renderEverything();

  // Simulate delivery after ETA. This is just a timeout; in production we would pair with a backend.
  setTimeout(() => {
    msg.status = 'delivered';
    msg.eta = 0;
    checkBadges();
    saveState();
    renderEverything();
  }, msg.eta * 1000);

  form.reset();
}

function calculateEtaSeconds() {
  // Start with a base ETA so every flight feels weighty.
  const base = 18;
  // Apply the weather modifier from the last fetched forecast.
  return Math.round(base * (state.weather.modifier || 1));
}

// --- Weather lookup ---
const OPEN_WEATHER_KEY = 'YOUR_OPENWEATHERMAP_KEY';

async function handleWeatherCheck() {
  const areaCode = areaCodeInput.value.trim();
  if (!areaCode) {
    weatherImpactEl.textContent = 'Add an area code to check the route.';
    return;
  }

  state.weather.areaCode = areaCode;
  weatherSummaryEl.textContent = 'Checking skies…';
  try {
    // Fetching public weather data; this call needs a valid API key.
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${areaCode},US&units=metric&appid=${OPEN_WEATHER_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Bad response');
    const data = await res.json();
    const description = data.weather?.[0]?.main || 'Clear';
    const impactLabel = pickImpactLabel(description);
    updateWeatherState(description, impactLabel);
  } catch (err) {
    // If the API key is missing, we still provide a friendly default so the UI does not break.
    updateWeatherState('Clear', 'Tailwind');
  }

  saveState();
  renderWeather();
}

function pickImpactLabel(description) {
  if (/thunder|storm/i.test(description)) return 'Storm';
  if (/rain|drizzle/i.test(description)) return 'Drizzle';
  if (/cloud/i.test(description)) return 'Clear';
  return 'Tailwind';
}

function updateWeatherState(summary, impactLabel) {
  state.weather.summary = summary;
  state.weather.impact = `${impactLabel} conditions influence the ETA.`;
  state.weather.modifier = WEATHER_IMPACT[impactLabel] || 1;
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

// --- Render everything in one go ---
function renderEverything() {
  renderStats();
  renderBadges();
  renderTimeline();
  renderWeather();
}

// --- Startup ---
function init() {
  // Preload UI with saved state.
  renderEverything();

  // Wire up listeners so every input updates the game.
  form.addEventListener('submit', handleSend);
  checkWeatherBtn.addEventListener('click', handleWeatherCheck);
  pigeonNameInput.addEventListener('input', handleNameChange);
  pigeonColorInput.addEventListener('change', handleColorChange);

  // Show whether the player already sent today.
  if (alreadySentToday()) {
    dailyStatusEl.textContent = 'You already sent today. Check back tomorrow!';
  }
}

init();
