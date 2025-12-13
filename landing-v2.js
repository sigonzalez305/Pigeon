(function () {
  const STORAGE_KEY = 'pigeon_v2_state';
  const STATE_VERSION = 1;
  const MAX_LOGS = 80;
  const DEFAULT_STATE = {
    version: STATE_VERSION,
    coop: {
      name: 'Sky Courier',
      color: 'silver',
      pigeonGearImage: '',
    },
    stats: {
      level: 3,
      xp: 120,
      badges: ['First Flight', 'Skyfriend'],
      history: [],
    },
    runtime: {
      editMode: false,
      dailyLimitUsed: false,
      sessionFlag: '',
      weather: {
        lastChecked: null,
        summary: 'No check yet.',
      },
      composerOpen: false,
      showHistory: false,
    },
  };

  const qs = (id) => document.getElementById(id);
  const elements = {
    pigeonName: qs('pigeonName'),
    pigeonColor: qs('pigeonColor'),
    editBtn: qs('editBtn'),
    resetBtn: qs('resetBtn'),
    messageBtn: qs('messageBtn'),
    historyBtn: qs('historyBtn'),
    weatherBtn: qs('weatherBtn'),
    sendBtn: qs('sendBtn'),
    closeComposer: qs('closeComposer'),
    composer: qs('composer'),
    messageText: qs('messageText'),
    historyPanel: qs('historyPanel'),
    historyList: qs('historyList'),
    historyCount: qs('historyCount'),
    weatherResult: qs('weatherResult'),
    weatherMeta: qs('weatherMeta'),
    editState: qs('editState'),
    dailyState: qs('dailyState'),
    sessionFlag: qs('sessionFlag'),
    messageCount: qs('messageCount'),
    stateVersionLabel: qs('stateVersionLabel'),
    logOutput: qs('logOutput'),
    pigeonGearImage: qs('pigeonGearImage'),
    pigeonPlaceholder: qs('pigeonPlaceholder'),
    editStatus: qs('editStatus'),
    resetStatus: qs('resetStatus'),
    messageStatus: qs('messageStatus'),
    historyStatus: qs('historyStatus'),
    weatherStatus: qs('weatherStatus'),
    weatherDetailBtn: qs('weatherDetailBtn'),
    coopBadge: qs('coopBadge'),
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function log(message, meta = '') {
    const line = document.createElement('div');
    line.innerHTML = `<strong>${new Date().toLocaleTimeString()}:</strong> ${message} ${meta}`.trim();
    elements.logOutput.prepend(line);
    while (elements.logOutput.childElementCount > MAX_LOGS) {
      elements.logOutput.lastElementChild?.remove();
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return deepClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      if (parsed.version !== STATE_VERSION) return deepClone(DEFAULT_STATE);
      return repairState(parsed);
    } catch (err) {
      console.error('Failed to load state', err);
      return deepClone(DEFAULT_STATE);
    }
  }

  function repairState(state) {
    const safe = deepClone(DEFAULT_STATE);
    safe.coop = { ...safe.coop, ...(state.coop || {}) };
    safe.stats = { ...safe.stats, ...(state.stats || {}) };
    safe.stats.history = Array.isArray(state?.stats?.history) ? state.stats.history : safe.stats.history;
    safe.runtime = { ...safe.runtime, ...(state.runtime || {}) };
    safe.runtime.weather = { ...safe.runtime.weather, ...(state.runtime?.weather || {}) };
    safe.runtime.editMode = Boolean(safe.runtime.editMode);
    safe.runtime.dailyLimitUsed = Boolean(safe.runtime.dailyLimitUsed);
    safe.runtime.composerOpen = Boolean(safe.runtime.composerOpen);
    safe.runtime.showHistory = Boolean(safe.runtime.showHistory);
    safe.version = STATE_VERSION;
    return safe;
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  function renderCoop() {
    elements.pigeonName.value = state.coop.name;
    elements.pigeonColor.value = state.coop.color;
    const hasImage = Boolean(state.coop.pigeonGearImage);
    elements.pigeonGearImage.style.display = hasImage ? 'block' : 'none';
    elements.pigeonPlaceholder.style.display = hasImage ? 'none' : 'grid';
    if (hasImage) {
      elements.pigeonGearImage.src = state.coop.pigeonGearImage;
    } else {
      elements.pigeonGearImage.removeAttribute('src');
    }
    elements.pigeonName.disabled = !state.runtime.editMode;
    elements.pigeonColor.disabled = !state.runtime.editMode;
    elements.editBtn.textContent = state.runtime.editMode ? 'Save' : 'Edit';
  }

  function renderStats() {
    elements.editState.textContent = state.runtime.editMode ? 'on' : 'off';
    elements.dailyState.textContent = String(state.runtime.dailyLimitUsed);
    elements.sessionFlag.textContent = state.runtime.sessionFlag || 'none';
    elements.messageCount.textContent = state.stats.history.length;
    elements.historyCount.textContent = state.stats.history.length;
    elements.stateVersionLabel.textContent = `State v${STATE_VERSION}`;
    elements.editStatus.textContent = state.runtime.editMode ? 'on' : 'off';
    elements.messageStatus.textContent = state.runtime.composerOpen ? 'open' : 'closed';
    elements.historyStatus.textContent = state.runtime.showHistory ? 'visible' : 'hidden';
    elements.resetStatus.textContent = state.runtime.sessionFlag || 'ready';
    elements.weatherStatus.textContent = state.runtime.weather.lastChecked ? 'checked' : 'idle';
    elements.coopBadge.textContent = 'coop intact';
  }

  function renderHistory() {
    elements.historyList.innerHTML = '';
    state.stats.history.forEach((entry) => {
      const item = document.createElement('li');
      const date = new Date(entry.timestamp).toLocaleString();
      item.textContent = `${date} — ${entry.text}`;
      elements.historyList.appendChild(item);
    });
  }

  function renderWeather() {
    const last = state.runtime.weather.lastChecked;
    elements.weatherResult.textContent = state.runtime.weather.summary;
    elements.weatherMeta.textContent = `Last checked: ${last ? new Date(last).toLocaleTimeString() : 'never'}`;
  }

  function toggleComposer(open) {
    state.runtime.composerOpen = open;
    elements.composer.hidden = !open;
  }

  function updateUI() {
    renderCoop();
    renderStats();
    renderHistory();
    renderWeather();
    elements.historyPanel.hidden = !state.runtime.showHistory;
    toggleComposer(state.runtime.composerOpen);
    saveState(state);
  }

  function addGlobalClickLogger() {
    document.addEventListener(
      'click',
      (event) => {
        const targetLabel = event.target?.tagName ? event.target.tagName.toLowerCase() : 'unknown';
        const id = event.target?.id ? `#${event.target.id}` : '';
        log(`click`, `${targetLabel}${id ? ' ' + id : ''}`);
      },
      true
    );
  }

  async function checkWeather() {
    log('clicked: check-weather');
    elements.weatherStatus.textContent = 'checking…';
    elements.weatherResult.textContent = 'Checking weather…';
    const key = window?.WEATHER_API_KEY || window?.env?.WEATHER_API_KEY;
    const fallbackSummary = 'Clear skies over the coop. Flight path is safe.';

    try {
      let summary = fallbackSummary;
      if (key) {
        const resp = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${key}&q=New%20York`
        );
        if (!resp.ok) throw new Error('Weather API failed');
        const data = await resp.json();
        summary = `${data.location.name}: ${data.current.condition.text}, ${data.current.temp_f}°F`;
      } else {
        summary = 'Deterministic mock: NYC, calm winds, 68°F, clear skies.';
      }
      state.runtime.weather.lastChecked = Date.now();
      state.runtime.weather.summary = summary;
      renderWeather();
      elements.weatherStatus.textContent = 'checked';
      log('weather updated', summary);
    } catch (err) {
      state.runtime.weather.lastChecked = Date.now();
      state.runtime.weather.summary = fallbackSummary;
      renderWeather();
      elements.weatherStatus.textContent = 'fallback';
      log('weather fallback', err?.message || 'unknown error');
    }
    saveState(state);
  }

  function toggleEdit() {
    log('clicked: edit');
    state.runtime.editMode = !state.runtime.editMode;
    if (!state.runtime.editMode) {
      state.coop.name = elements.pigeonName.value.trim() || DEFAULT_STATE.coop.name;
      state.coop.color = elements.pigeonColor.value;
    }
    updateUI();
  }

  function doReset() {
    log('clicked: reset');
    state.runtime.dailyLimitUsed = false;
    state.runtime.sessionFlag = 'reset:testing-cleared';
    state.runtime.weather = deepClone(DEFAULT_STATE.runtime.weather);
    state.runtime.composerOpen = false;
    state.runtime.editMode = false;
    elements.messageText.value = '';
    updateUI();
  }

  function toggleHistory() {
    log('clicked: history');
    state.runtime.showHistory = !state.runtime.showHistory;
    updateUI();
  }

  function openComposer() {
    log('clicked: message');
    state.runtime.composerOpen = true;
    updateUI();
  }

  function closeComposerPanel() {
    log('clicked: close-composer');
    state.runtime.composerOpen = false;
    updateUI();
  }

  function sendMessage() {
    log('clicked: send');
    const text = elements.messageText.value.trim();
    if (!text) {
      log('send blocked', 'no message text');
      return;
    }
    const entry = {
      text,
      timestamp: Date.now(),
    };
    state.stats.history.unshift(entry);
    state.runtime.dailyLimitUsed = true;
    elements.messageText.value = '';
    updateUI();
  }

  function wireButtons() {
    elements.editBtn.addEventListener('click', toggleEdit);
    elements.resetBtn.addEventListener('click', doReset);
    elements.historyBtn.addEventListener('click', toggleHistory);
    elements.messageBtn.addEventListener('click', openComposer);
    elements.weatherBtn.addEventListener('click', checkWeather);
    elements.weatherDetailBtn.addEventListener('click', checkWeather);
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.closeComposer.addEventListener('click', closeComposerPanel);
  }

  function init() {
    addGlobalClickLogger();
    wireButtons();
    updateUI();
  }

  init();
})();
