/**
 * PIGEON - Main Application Controller
 *
 * Ties together state, UI, and interactions.
 * Guarantees click interactions, safe rendering, and no silent failures.
 */

import * as State from './pigeon-state.js';
import * as Debug from './pigeon-debug.js';
import * as Weather from './pigeon-weather.js';

// DOM Elements
let elements = {};

// Current weather cache
let currentWeather = null;

/**
 * Safe number formatting
 * Never crashes on null/undefined
 */
function safeNumber(value, decimals = 0) {
  try {
    const num = Number(value);
    if (isNaN(num)) return '0';
    return num.toFixed(decimals);
  } catch (err) {
    Debug.logError('Number formatting error', err);
    return '0';
  }
}

/**
 * Safe date formatting
 */
function safeDate(timestamp) {
  try {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Never';
    return date.toLocaleString();
  } catch (err) {
    Debug.logError('Date formatting error', err);
    return 'Never';
  }
}

/**
 * Safe text rendering
 */
function safeText(value, fallback = '') {
  try {
    return String(value || fallback);
  } catch (err) {
    Debug.logError('Text rendering error', err);
    return fallback;
  }
}

/**
 * Render pigeon display
 * Safe - never crashes even with missing data
 */
function renderPigeonDisplay() {
  try {
    const state = State.getState();
    const pigeon = state?.pigeon || {};

    // Update name
    const nameEl = elements.app.querySelector('.pigeon-name');
    if (nameEl) {
      nameEl.textContent = safeText(pigeon.name, 'Courier');
    }

    // Update avatar color
    const avatarEl = elements.app.querySelector('.pigeon-avatar');
    if (avatarEl && pigeon.color) {
      avatarEl.style.backgroundColor = pigeon.color;
    }

    // Update stats
    if (elements.pigeonMood) {
      elements.pigeonMood.textContent = safeText(pigeon.mood, 'neutral');
    }

    if (elements.pigeonEnergy) {
      elements.pigeonEnergy.textContent = safeNumber(pigeon.energy, 0);
    }

    if (elements.pigeonLevel) {
      elements.pigeonLevel.textContent = safeNumber(pigeon.level, 0);
    }

    if (elements.pigeonXP) {
      elements.pigeonXP.textContent = safeNumber(pigeon.xp, 0);
    }

    Debug.logInfo('Pigeon display rendered');
  } catch (err) {
    Debug.logError('Failed to render pigeon display', err);
  }
}

/**
 * Render status bar
 */
function renderStatusBar() {
  try {
    const state = State.getState();
    const session = state?.session || {};
    const pigeon = state?.pigeon || {};

    if (elements.messagesUsed) {
      elements.messagesUsed.textContent = safeNumber(session.dailyMessagesUsed, 0);
    }

    if (elements.messagesLimit) {
      elements.messagesLimit.textContent = safeNumber(session.dailyLimit, 0);
    }

    if (elements.lastDelivery) {
      elements.lastDelivery.textContent = safeDate(pigeon.lastMessageSentAt);
    }

    Debug.logInfo('Status bar rendered');
  } catch (err) {
    Debug.logError('Failed to render status bar', err);
  }
}

/**
 * Render message history
 * Safe - each item rendered independently to prevent cascade failures
 */
function renderMessageHistory() {
  try {
    if (!elements.historyList) return;

    const state = State.getState();
    const messages = state?.messages || [];

    if (messages.length === 0) {
      elements.historyList.innerHTML = '<p class="empty-state">No messages sent yet</p>';
      Debug.logInfo('No messages to display');
      return;
    }

    elements.historyList.innerHTML = '';

    messages.forEach((msg, index) => {
      try {
        const item = document.createElement('div');
        item.className = 'history-item';

        const header = document.createElement('div');
        header.className = 'history-item-header';
        header.innerHTML = `
          <span>From: ${safeText(msg.fromAreaCode, '???')}</span>
          <span>To: ${safeText(msg.toAreaCode, '???')}</span>
        `;

        const body = document.createElement('div');
        body.className = 'history-item-body';
        body.textContent = safeText(msg.body, '[No message]');

        const meta = document.createElement('div');
        meta.className = 'history-item-meta';
        meta.innerHTML = `
          <div>Status: ${safeText(msg.status, 'unknown')}</div>
          <div>Sent: ${safeDate(msg.createdAt)}</div>
          ${msg.deliveredAt ? `<div>Delivered: ${safeDate(msg.deliveredAt)}</div>` : ''}
        `;

        item.appendChild(header);
        item.appendChild(body);
        item.appendChild(meta);

        elements.historyList.appendChild(item);
      } catch (err) {
        Debug.logError(`Failed to render message ${index}`, err);
        // Continue rendering other messages
      }
    });

    Debug.logInfo(`Rendered ${messages.length} messages`);
  } catch (err) {
    Debug.logError('Failed to render message history', err);
  }
}

/**
 * Render weather display
 */
function renderWeatherDisplay() {
  try {
    if (!elements.weatherDisplay) return;

    if (!currentWeather) {
      elements.weatherDisplay.innerHTML = '<p>Enter area codes in the Send Message form to check weather</p>';
      return;
    }

    const { from, to, delayMultiplier, isLive } = currentWeather;

    elements.weatherDisplay.innerHTML = `
      <div class="weather-card">
        <div class="weather-location">From: Area Code ${safeText(from?.location, 'Unknown')}</div>
        <div class="weather-condition">${Weather.formatWeatherDescription(from)}</div>
      </div>
      <div class="weather-card">
        <div class="weather-location">To: Area Code ${safeText(to?.location, 'Unknown')}</div>
        <div class="weather-condition">${Weather.formatWeatherDescription(to)}</div>
      </div>
      <div class="weather-card">
        <div class="weather-location">Flight Impact</div>
        <div class="weather-condition">Delay Multiplier: ${safeNumber(delayMultiplier, 1)}x</div>
        <div class="weather-condition">Source: ${isLive ? '🌐 Live Data' : '🎭 Mock Data'}</div>
      </div>
    `;

    Debug.logInfo('Weather display rendered', currentWeather);
  } catch (err) {
    Debug.logError('Failed to render weather display', err);
  }
}

/**
 * Render all UI components
 */
function renderAll() {
  renderPigeonDisplay();
  renderStatusBar();
  renderMessageHistory();
  renderWeatherDisplay();
}

/**
 * Show panel (hide others)
 */
function showPanel(panelId) {
  try {
    // Hide all panels
    ['panelEditPigeon', 'panelSendMessage', 'panelHistory', 'panelWeather'].forEach(id => {
      const panel = elements[id];
      if (panel) {
        panel.classList.add('hidden');
      }
    });

    // Show requested panel
    const panel = elements[panelId];
    if (panel) {
      panel.classList.remove('hidden');
      Debug.logInfo(`Showing panel: ${panelId}`);
    }
  } catch (err) {
    Debug.logError(`Failed to show panel: ${panelId}`, err);
  }
}

/**
 * Hide panel
 */
function hidePanel(panelId) {
  try {
    const panel = elements[panelId];
    if (panel) {
      panel.classList.add('hidden');
      Debug.logInfo(`Hiding panel: ${panelId}`);
    }
  } catch (err) {
    Debug.logError(`Failed to hide panel: ${panelId}`, err);
  }
}

/**
 * Handle Edit Pigeon
 */
function handleEditPigeon() {
  try {
    const state = State.getState();
    const pigeon = state.pigeon;

    // Populate form
    if (elements.inputPigeonName) {
      elements.inputPigeonName.value = pigeon.name;
    }
    if (elements.inputPigeonColor) {
      elements.inputPigeonColor.value = pigeon.color;
    }

    showPanel('panelEditPigeon');
    Debug.logInfo('Edit pigeon panel opened');
  } catch (err) {
    Debug.logError('Failed to handle edit pigeon', err);
  }
}

/**
 * Handle Save Pigeon
 */
function handleSavePigeon() {
  try {
    const name = elements.inputPigeonName?.value || 'Courier';
    const color = elements.inputPigeonColor?.value || '#8B7355';

    State.updatePigeon({ name, color });

    hidePanel('panelEditPigeon');
    renderPigeonDisplay();

    Debug.logInfo('Pigeon saved', { name, color });
  } catch (err) {
    Debug.logError('Failed to save pigeon', err);
  }
}

/**
 * Handle Send Message
 */
function handleSendMessage() {
  try {
    const state = State.getState();

    // Check daily limit
    if (state.session.dailyMessagesUsed >= state.session.dailyLimit) {
      alert('Daily message limit reached! Reset your session to send more.');
      Debug.logWarning('Daily limit reached');
      return;
    }

    // Check energy
    if (state.pigeon.energy < 20) {
      alert('Your pigeon is too tired! Let them rest.');
      Debug.logWarning('Pigeon energy too low');
      return;
    }

    showPanel('panelSendMessage');
    Debug.logInfo('Send message panel opened');
  } catch (err) {
    Debug.logError('Failed to handle send message', err);
  }
}

/**
 * Handle Send Now
 */
async function handleSendNow() {
  try {
    const fromArea = elements.inputFromArea?.value;
    const toArea = elements.inputToArea?.value;
    const messageBody = elements.inputMessage?.value;

    // Validation
    if (!fromArea || !toArea || !messageBody) {
      alert('Please fill in all fields');
      return;
    }

    if (fromArea.length !== 3 || toArea.length !== 3) {
      alert('Area codes must be exactly 3 digits');
      return;
    }

    Debug.logInfo('Sending message', { fromArea, toArea });

    // Calculate delivery time
    const distance = Weather.calculateDistance(fromArea, toArea);
    const weatherMultiplier = currentWeather?.delayMultiplier || 1.0;
    const delivery = Weather.calculateDelivery(distance, weatherMultiplier);

    const scheduledDeliveryAt = Date.now() + (delivery.delayedMinutes * 60 * 1000);

    // Add message
    const message = State.addMessage({
      fromAreaCode: fromArea,
      toAreaCode: toArea,
      body: messageBody,
      scheduledDeliveryAt,
    });

    // Consume energy
    State.consumeEnergy(15);

    // Add XP
    State.addXP(10);

    // Clear form
    if (elements.inputFromArea) elements.inputFromArea.value = '';
    if (elements.inputToArea) elements.inputToArea.value = '';
    if (elements.inputMessage) elements.inputMessage.value = '';

    hidePanel('panelSendMessage');
    renderAll();

    alert(`Message sent! Estimated delivery: ${delivery.delayedMinutes} minutes`);
    Debug.logInfo('Message sent successfully', message);
  } catch (err) {
    Debug.logError('Failed to send message', err);
    alert('Failed to send message. Check debug panel for details.');
  }
}

/**
 * Handle View History
 */
function handleViewHistory() {
  try {
    renderMessageHistory();
    showPanel('panelHistory');
    Debug.logInfo('History panel opened');
  } catch (err) {
    Debug.logError('Failed to handle view history', err);
  }
}

/**
 * Handle Check Weather
 */
async function handleCheckWeather() {
  try {
    const fromArea = elements.inputFromArea?.value || '212';
    const toArea = elements.inputToArea?.value || '415';

    Debug.logInfo('Checking weather', { fromArea, toArea });

    currentWeather = await Weather.getRouteWeather(fromArea, toArea);

    // Update state
    State.updateWeather({
      fromLocation: fromArea,
      toLocation: toArea,
      condition: currentWeather.from.condition,
      temperature: currentWeather.from.temperature,
      delayMultiplier: currentWeather.delayMultiplier,
      isLive: currentWeather.isLive,
    });

    renderWeatherDisplay();
    showPanel('panelWeather');

    Debug.logInfo('Weather checked successfully', currentWeather);
  } catch (err) {
    Debug.logError('Failed to check weather', err);
    alert('Failed to check weather. Check debug panel for details.');
  }
}

/**
 * Handle Reset Daily Session
 */
function handleResetSession() {
  try {
    const confirmed = confirm('Reset daily session? This will reset message count and edit mode.');

    if (confirmed) {
      State.resetDailySession();
      renderAll();
      Debug.logInfo('Daily session reset');
      alert('Daily session reset!');
    }
  } catch (err) {
    Debug.logError('Failed to reset session', err);
  }
}

/**
 * Set up all button click handlers
 * Uses event delegation for safety
 */
function setupEventHandlers() {
  // Event delegation on document
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target) return;

    const action = target.dataset?.action || target.closest('[data-action]')?.dataset?.action;
    if (!action) return;

    Debug.logInfo(`Action triggered: ${action}`);

    try {
      switch (action) {
        case 'edit-pigeon':
          handleEditPigeon();
          break;
        case 'save-pigeon':
          handleSavePigeon();
          break;
        case 'close-edit':
          hidePanel('panelEditPigeon');
          break;
        case 'send-message':
          handleSendMessage();
          break;
        case 'send-now':
          handleSendNow();
          break;
        case 'close-send':
          hidePanel('panelSendMessage');
          break;
        case 'view-history':
          handleViewHistory();
          break;
        case 'close-history':
          hidePanel('panelHistory');
          break;
        case 'check-weather':
          handleCheckWeather();
          break;
        case 'close-weather':
          hidePanel('panelWeather');
          break;
        case 'reset-session':
          handleResetSession();
          break;
        default:
          Debug.logWarning(`Unknown action: ${action}`);
      }
    } catch (err) {
      Debug.logError(`Action handler failed: ${action}`, err);
    }
  });

  Debug.logLifecycle('Event handlers installed');
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  elements = {
    app: document.getElementById('app'),
    pigeonMood: document.getElementById('pigeonMood'),
    pigeonEnergy: document.getElementById('pigeonEnergy'),
    pigeonLevel: document.getElementById('pigeonLevel'),
    pigeonXP: document.getElementById('pigeonXP'),
    messagesUsed: document.getElementById('messagesUsed'),
    messagesLimit: document.getElementById('messagesLimit'),
    lastDelivery: document.getElementById('lastDelivery'),
    panelEditPigeon: document.getElementById('panelEditPigeon'),
    panelSendMessage: document.getElementById('panelSendMessage'),
    panelHistory: document.getElementById('panelHistory'),
    panelWeather: document.getElementById('panelWeather'),
    inputPigeonName: document.getElementById('inputPigeonName'),
    inputPigeonColor: document.getElementById('inputPigeonColor'),
    inputFromArea: document.getElementById('inputFromArea'),
    inputToArea: document.getElementById('inputToArea'),
    inputMessage: document.getElementById('inputMessage'),
    historyList: document.getElementById('historyList'),
    weatherDisplay: document.getElementById('weatherDisplay'),
  };

  Debug.logLifecycle('DOM elements cached');
}

/**
 * Initialize application
 */
function initApp() {
  try {
    Debug.logLifecycle('App initialization started');

    // Initialize debug system first
    Debug.initDebug();

    // Initialize state
    State.initState();

    // Cache DOM elements
    cacheElements();

    // Subscribe to state changes
    State.subscribe(() => {
      Debug.logInfo('State changed, re-rendering');
      renderAll();
    });

    // Set up event handlers
    setupEventHandlers();

    // Initial render
    renderAll();

    // Refresh mood periodically
    setInterval(() => {
      State.refreshMood();
    }, 60000); // Every minute

    Debug.logLifecycle('App initialization complete');
    Debug.logStateSnapshot(State.getState());
  } catch (err) {
    Debug.logError('App initialization failed', err);
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
