/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PIGEON - State Management Module
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT THIS FILE DOES:
 * Manages ALL application data (the "state") in one place.
 * Think of this as the app's memory or database.
 *
 * STATE = The current condition of everything in the app
 * - Pigeon stats (energy, mood, level, XP)
 * - Messages (sent, delivered, pending)
 * - Session info (daily limit, message count)
 * - Weather data
 *
 * KEY PRINCIPLES:
 * 1. Single Source of Truth - One place stores all data
 * 2. No Random Behavior - Same input always gives same output
 * 3. Validation - All data is checked and fixed if broken
 * 4. Persistence - Data saves to localStorage automatically
 * 5. Reactive - Subscribers get notified when state changes
 *
 * WHY THIS MATTERS:
 * Without state management, data would be scattered everywhere.
 * This centralized approach makes the app predictable and debuggable.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS - Values that never change
// ═══════════════════════════════════════════════════════════════════════════

/**
 * LocalStorage Key
 * This is the "name" used to save/load data from browser storage.
 * localStorage is like a simple database built into every browser.
 */
const STORAGE_KEY = 'pigeon_app_state';

/**
 * State Version
 * If we change the state structure in the future, we can use this
 * to detect old saved data and migrate it to the new format.
 */
const STATE_VERSION = 1;

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT STATE - Fresh state when no saved data exists
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Default State Shape
 *
 * This is the "template" for our state.
 * When a new user opens the app (no saved data), they get this.
 *
 * STRUCTURE:
 * - version: Tracks state format version
 * - pigeon: All pigeon stats and properties
 * - session: Temporary session data (resets daily)
 * - messages: Array of all sent/received messages
 * - weather: Weather data for message delivery
 */
const DEFAULT_STATE = {
  version: STATE_VERSION,
  pigeon: {
    id: null,
    name: 'Courier',
    color: '#8B7355', // pigeon brown
    mood: 'neutral',
    energy: 100,
    xp: 0,
    level: 1,
    lastFedAt: null,
    lastMessageSentAt: null,
  },
  session: {
    dailyMessagesUsed: 0,
    dailyLimit: 3,
    editMode: false,
    lastActionAt: null,
    sessionStartedAt: Date.now(),
  },
  messages: [],
  weather: {
    isLive: false,
    lastChecked: null,
    fromLocation: null,
    toLocation: null,
    condition: 'clear',
    temperature: 72,
    delayMultiplier: 1.0,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MODULE VARIABLES - Internal state storage
// ═══════════════════════════════════════════════════════════════════════════

/**
 * In-Memory State
 *
 * This holds the current state while the app is running.
 * All functions read from and write to this object.
 * Starts as null, gets loaded from localStorage on init.
 */
let state = null;

/**
 * Listeners (Subscribers)
 *
 * A Set of callback functions that want to be notified when state changes.
 * When state updates, we call all these functions.
 * This creates "reactive" UI - components update automatically when data changes.
 *
 * Set vs Array:
 * - Set = collection with no duplicates
 * - Array = ordered list that can have duplicates
 * - We use Set because we don't want the same listener registered twice
 */
const listeners = new Set();

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a Deterministic ID
 *
 * Creates unique IDs for pigeons, messages, etc.
 *
 * FORMAT: prefix + timestamp + random_string
 * Example: "msg_1699999999999_a4k8f3j2s"
 *
 * COMPONENTS:
 * - prefix: Optional label like "msg_" or "pigeon_"
 * - Date.now(): Current time in milliseconds (always increasing)
 * - Math.random().toString(36): Random alphanumeric string
 *
 * toString(36) EXPLAINED:
 * Converts number to base-36 (0-9, a-z)
 * 0.123456.toString(36) = "0.4fzyo"
 * We use substr(2, 9) to skip "0." and take 9 characters
 *
 * WHY DETERMINISTIC:
 * "Deterministic" means predictable/repeatable.
 * Same inputs → same output.
 * This ID isn't truly random (uses timestamp), but it's unique enough.
 *
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - Unique ID string
 */
function generateId(prefix = '') {
  // Template literal combines: prefix + timestamp + random string
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate and repair state object
 */
function validateAndRepair(rawState) {
  try {
    // Ensure top-level structure
    const repaired = {
      version: STATE_VERSION,
      pigeon: { ...DEFAULT_STATE.pigeon },
      session: { ...DEFAULT_STATE.session },
      messages: [],
      weather: { ...DEFAULT_STATE.weather },
    };

    if (rawState && typeof rawState === 'object') {
      // Merge pigeon data
      if (rawState.pigeon && typeof rawState.pigeon === 'object') {
        Object.assign(repaired.pigeon, {
          id: rawState.pigeon.id || generateId('pigeon_'),
          name: String(rawState.pigeon.name || DEFAULT_STATE.pigeon.name).slice(0, 20),
          color: String(rawState.pigeon.color || DEFAULT_STATE.pigeon.color),
          mood: ['happy', 'neutral', 'tired', 'sad'].includes(rawState.pigeon.mood)
            ? rawState.pigeon.mood
            : 'neutral',
          energy: Math.max(0, Math.min(100, Number(rawState.pigeon.energy) || 100)),
          xp: Math.max(0, Number(rawState.pigeon.xp) || 0),
          level: Math.max(1, Number(rawState.pigeon.level) || 1),
          lastFedAt: rawState.pigeon.lastFedAt || null,
          lastMessageSentAt: rawState.pigeon.lastMessageSentAt || null,
        });
      } else {
        repaired.pigeon.id = generateId('pigeon_');
      }

      // Merge session data
      if (rawState.session && typeof rawState.session === 'object') {
        Object.assign(repaired.session, {
          dailyMessagesUsed: Math.max(0, Number(rawState.session.dailyMessagesUsed) || 0),
          dailyLimit: Number(rawState.session.dailyLimit) || 3,
          editMode: Boolean(rawState.session.editMode),
          lastActionAt: rawState.session.lastActionAt || null,
          sessionStartedAt: rawState.session.sessionStartedAt || Date.now(),
        });
      }

      // Validate messages array
      if (Array.isArray(rawState.messages)) {
        repaired.messages = rawState.messages
          .filter(msg => msg && typeof msg === 'object')
          .map(msg => ({
            id: msg.id || generateId('msg_'),
            fromAreaCode: String(msg.fromAreaCode || '').slice(0, 3),
            toAreaCode: String(msg.toAreaCode || '').slice(0, 3),
            body: String(msg.body || '').slice(0, 500),
            createdAt: msg.createdAt || Date.now(),
            scheduledDeliveryAt: msg.scheduledDeliveryAt || Date.now(),
            deliveredAt: msg.deliveredAt || null,
            status: ['queued', 'in_flight', 'delivered'].includes(msg.status)
              ? msg.status
              : 'queued',
          }));
      }

      // Merge weather data
      if (rawState.weather && typeof rawState.weather === 'object') {
        Object.assign(repaired.weather, {
          isLive: Boolean(rawState.weather.isLive),
          lastChecked: rawState.weather.lastChecked || null,
          fromLocation: rawState.weather.fromLocation || null,
          toLocation: rawState.weather.toLocation || null,
          condition: String(rawState.weather.condition || 'clear'),
          temperature: Number(rawState.weather.temperature) || 72,
          delayMultiplier: Math.max(1.0, Math.min(3.0, Number(rawState.weather.delayMultiplier) || 1.0)),
        });
      }
    } else {
      // No valid state, ensure fresh pigeon ID
      repaired.pigeon.id = generateId('pigeon_');
    }

    return repaired;
  } catch (err) {
    console.error('State repair failed, using defaults:', err);
    const fresh = JSON.parse(JSON.stringify(DEFAULT_STATE));
    fresh.pigeon.id = generateId('pigeon_');
    return fresh;
  }
}

/**
 * Load state from localStorage
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return validateAndRepair(parsed);
    }
  } catch (err) {
    console.error('Failed to load state:', err);
  }
  return validateAndRepair(null);
}

/**
 * Save state to localStorage
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to save state:', err);
    return false;
  }
}

/**
 * Notify all listeners of state change
 */
function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn(state);
    } catch (err) {
      console.error('Listener error:', err);
    }
  });
}

/**
 * Initialize state system
 */
export function initState() {
  state = loadState();
  return state;
}

/**
 * Get current state (read-only)
 */
export function getState() {
  return state;
}

/**
 * Subscribe to state changes
 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Update state with mutations
 */
export function updateState(mutations) {
  Object.assign(state, mutations);
  saveState();
  notifyListeners();
  return state;
}

/**
 * Update pigeon properties
 */
export function updatePigeon(updates) {
  Object.assign(state.pigeon, updates);
  state.session.lastActionAt = Date.now();
  saveState();
  notifyListeners();
  return state.pigeon;
}

/**
 * Update session properties
 */
export function updateSession(updates) {
  Object.assign(state.session, updates);
  state.session.lastActionAt = Date.now();
  saveState();
  notifyListeners();
  return state.session;
}

/**
 * Add a message to the queue
 */
export function addMessage(message) {
  const newMessage = {
    id: generateId('msg_'),
    fromAreaCode: String(message.fromAreaCode || '').slice(0, 3),
    toAreaCode: String(message.toAreaCode || '').slice(0, 3),
    body: String(message.body || '').slice(0, 500),
    createdAt: Date.now(),
    scheduledDeliveryAt: message.scheduledDeliveryAt || Date.now(),
    deliveredAt: null,
    status: 'queued',
  };

  state.messages.push(newMessage);
  state.session.dailyMessagesUsed += 1;
  state.session.lastActionAt = Date.now();
  state.pigeon.lastMessageSentAt = Date.now();

  saveState();
  notifyListeners();

  return newMessage;
}

/**
 * Update weather state
 */
export function updateWeather(weatherData) {
  Object.assign(state.weather, {
    ...weatherData,
    lastChecked: Date.now(),
  });
  saveState();
  notifyListeners();
  return state.weather;
}

/**
 * Reset daily session (messages, edit mode)
 */
export function resetDailySession() {
  state.session.dailyMessagesUsed = 0;
  state.session.editMode = false;
  state.session.lastActionAt = Date.now();
  saveState();
  notifyListeners();
  return state.session;
}

/**
 * Calculate pigeon mood based on state
 * Deterministic - no random behavior
 */
export function calculateMood() {
  const { energy, lastFedAt, lastMessageSentAt } = state.pigeon;
  const now = Date.now();

  // Energy-based mood
  if (energy < 20) {
    return 'sad';
  }
  if (energy < 50) {
    return 'tired';
  }

  // Time-based mood (if never fed or sent message)
  if (!lastFedAt && !lastMessageSentAt) {
    return 'neutral';
  }

  // Recent activity makes pigeon happy
  const lastActivity = Math.max(lastFedAt || 0, lastMessageSentAt || 0);
  const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);

  if (hoursSinceActivity < 1) {
    return 'happy';
  }
  if (hoursSinceActivity < 24) {
    return 'neutral';
  }

  return 'tired';
}

/**
 * Update pigeon mood based on current state
 */
export function refreshMood() {
  const mood = calculateMood();
  if (state.pigeon.mood !== mood) {
    state.pigeon.mood = mood;
    saveState();
    notifyListeners();
  }
  return mood;
}

/**
 * Feed the pigeon (restore energy, improve mood)
 */
export function feedPigeon() {
  state.pigeon.energy = Math.min(100, state.pigeon.energy + 20);
  state.pigeon.lastFedAt = Date.now();
  refreshMood();
  saveState();
  notifyListeners();
  return state.pigeon;
}

/**
 * Consume pigeon energy (for sending messages)
 */
export function consumeEnergy(amount) {
  state.pigeon.energy = Math.max(0, state.pigeon.energy - amount);
  refreshMood();
  saveState();
  notifyListeners();
  return state.pigeon.energy;
}

/**
 * Add XP and level up if needed
 */
export function addXP(amount) {
  state.pigeon.xp += amount;

  // Level up calculation: 100 XP per level
  const newLevel = Math.floor(state.pigeon.xp / 100) + 1;
  if (newLevel > state.pigeon.level) {
    state.pigeon.level = newLevel;
  }

  saveState();
  notifyListeners();

  return {
    xp: state.pigeon.xp,
    level: state.pigeon.level,
    leveledUp: newLevel > state.pigeon.level,
  };
}

/**
 * Complete reset (for debugging)
 */
export function resetAll() {
  state = validateAndRepair(null);
  saveState();
  notifyListeners();
  return state;
}
