const STORAGE_KEY = 'pigeon_v2_state';
const VERSION = 1;

const defaultState = {
  version: VERSION,
  pigeon: {
    name: 'Sky Courier',
    signatureColor: 'teal',
    xp: 0,
    level: 1,
  },
  session: {
    editMode: false,
    dailyLimitUsed: false,
    lastActionAt: null,
    lastActionLabel: 'None',
  },
  messages: [],
  weather: {
    status: 'Unknown',
    lastCheckedAt: null,
    location: 'Seattle',
    tempF: null,
    description: 'Waiting for update',
    usingMock: true,
  },
  debug: {
    logs: [],
    errors: [],
  },
};

let state = hydrate();
const listeners = new Set();

function hydrate() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...defaultState, debug: { logs: [], errors: [] } };
    const parsed = JSON.parse(saved);
    if (parsed.version !== VERSION) {
      return { ...defaultState, debug: { logs: [], errors: [] } };
    }
    return {
      ...defaultState,
      ...parsed,
      pigeon: { ...defaultState.pigeon, ...parsed.pigeon },
      session: { ...defaultState.session, ...parsed.session },
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      weather: { ...defaultState.weather, ...parsed.weather },
      debug: { logs: [], errors: [] },
    };
  } catch (err) {
    console.error('Failed to parse stored state', err);
    return { ...defaultState, debug: { logs: [], errors: [] } };
  }
}

function persist(current) {
  const { debug, ...rest } = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function updateState(updater) {
  const next = typeof updater === 'function' ? updater(structuredClone(state)) : updater;
  state = next;
  persist(state);
  notify();
  return state;
}

export function touchAction(label) {
  return updateState((prev) => ({
    ...prev,
    session: {
      ...prev.session,
      lastActionAt: new Date().toISOString(),
      lastActionLabel: label,
    },
    debug: { ...prev.debug },
  }));
}

export function setPigeonProfile({ name, signatureColor }) {
  return updateState((prev) => ({
    ...prev,
    pigeon: {
      ...prev.pigeon,
      name: name ?? prev.pigeon.name,
      signatureColor: signatureColor ?? prev.pigeon.signatureColor,
    },
  }));
}

export function toggleEditMode() {
  return updateState((prev) => ({
    ...prev,
    session: {
      ...prev.session,
      editMode: !prev.session.editMode,
      lastActionAt: new Date().toISOString(),
    },
  }));
}

export function resetSession() {
  return updateState((prev) => ({
    ...prev,
    session: {
      editMode: false,
      dailyLimitUsed: false,
      lastActionAt: new Date().toISOString(),
      lastActionLabel: 'Session Reset',
    },
  }));
}

export function hardResetAll() {
  state = { ...defaultState, debug: { logs: [], errors: [] } };
  persist(state);
  notify();
  return state;
}

export function addMessage(entry) {
  return updateState((prev) => ({
    ...prev,
    messages: [entry, ...prev.messages].slice(0, 50),
    session: { ...prev.session, lastActionAt: new Date().toISOString() },
  }));
}

export function setWeatherState(weather) {
  return updateState((prev) => ({
    ...prev,
    weather: { ...prev.weather, ...weather },
    session: { ...prev.session, lastActionAt: new Date().toISOString() },
  }));
}

export function addDebugLog(entry) {
  return updateState((prev) => {
    const logs = [...prev.debug.logs, entry].slice(-50);
    return { ...prev, debug: { ...prev.debug, logs } };
  });
}

export function addDebugError(entry) {
  return updateState((prev) => {
    const errors = [...prev.debug.errors, entry].slice(-50);
    return { ...prev, debug: { ...prev.debug, errors } };
  });
}

export function getDefaults() {
  return structuredClone(defaultState);
}

export function storageHealthy() {
  try {
    const probeKey = `${STORAGE_KEY}_probe`;
    localStorage.setItem(probeKey, 'ok');
    localStorage.removeItem(probeKey);
    return true;
  } catch (err) {
    console.error('Storage check failed', err);
    return false;
  }
}

export const buildId = '1a4cc07';
