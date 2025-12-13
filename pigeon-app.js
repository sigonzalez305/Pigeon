/**
 * PIGEON - Tamagotchi + Messaging Application
 * Single-screen UI with care mechanics
 */

import * as State from './pigeon-state.js';
import * as Debug from './pigeon-debug.js';
import * as Weather from './pigeon-weather.js';

// DOM Elements
let elements = {};

// Current scroll draft
let currentDraft = null;

// Current weather cache
let currentWeather = null;

/**
 * Safe number formatting
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
 * Get pigeon state based on stats
 */
function getPigeonState(pigeon) {
  if (pigeon.energy < 30) return 'tired';
  if (pigeon.mood === 'happy') return 'happy';
  return 'idle';
}

/**
 * Get status message based on pigeon state
 */
function getStatusMessage(pigeon, hasScroll) {
  if (hasScroll) {
    return 'Your pigeon is carrying a message';
  }

  if (pigeon.energy < 20) {
    return 'Your pigeon is exhausted and needs rest';
  }

  if (pigeon.energy < 50) {
    return 'Your pigeon looks tired';
  }

  if (pigeon.mood === 'happy') {
    return 'Your pigeon is happy and energetic!';
  }

  return 'Your pigeon is resting peacefully';
}

/**
 * Update pigeon sprite state
 */
function updatePigeonSprite() {
  try {
    const state = State.getState();
    const pigeon = state?.pigeon || {};
    const sprite = elements.pigeonSprite;

    if (!sprite) return;

    const pigeonState = getPigeonState(pigeon);
    sprite.setAttribute('data-state', pigeonState);

    Debug.logInfo(`Pigeon state: ${pigeonState}`);
  } catch (err) {
    Debug.logError('Failed to update pigeon sprite', err);
  }
}

/**
 * Render status icons
 */
function renderStatusIcons() {
  try {
    const state = State.getState();
    const pigeon = state?.pigeon || {};

    if (elements.iconEnergy) {
      elements.iconEnergy.textContent = safeNumber(pigeon.energy, 0);
    }

    if (elements.iconMood) {
      elements.iconMood.textContent = safeText(pigeon.mood, 'neutral');
    }

    if (elements.iconLevel) {
      elements.iconLevel.textContent = safeNumber(pigeon.level, 0);
    }

    Debug.logInfo('Status icons rendered');
  } catch (err) {
    Debug.logError('Failed to render status icons', err);
  }
}

/**
 * Render pigeon name
 */
function renderPigeonName() {
  try {
    const state = State.getState();
    const pigeon = state?.pigeon || {};

    if (elements.pigeonName) {
      elements.pigeonName.textContent = safeText(pigeon.name, 'Courier');
    }

    // Update avatar color
    const avatar = document.querySelector('.pigeon-sprite');
    if (avatar && pigeon.color) {
      avatar.style.color = pigeon.color;
    }

    Debug.logInfo('Pigeon name rendered');
  } catch (err) {
    Debug.logError('Failed to render pigeon name', err);
  }
}

/**
 * Render status message
 */
function renderStatusMessage() {
  try {
    const state = State.getState();
    const pigeon = state?.pigeon || {};
    const hasScroll = !elements.messageScroll?.classList.contains('hidden');

    if (elements.statusMessage) {
      elements.statusMessage.textContent = getStatusMessage(pigeon, hasScroll);
    }

    Debug.logInfo('Status message rendered');
  } catch (err) {
    Debug.logError('Failed to render status message', err);
  }
}

/**
 * Update action button states
 */
function updateActionButtons() {
  try {
    const state = State.getState();
    const pigeon = state?.pigeon || {};
    const hasScroll = currentDraft !== null;

    // Send button - enabled only when scroll is attached
    if (elements.btnSend) {
      elements.btnSend.disabled = !hasScroll;
    }

    // Write button - disabled if pigeon is too tired or already has scroll
    if (elements.btnWrite) {
      elements.btnWrite.disabled = pigeon.energy < 20 || hasScroll;
    }

    // Feed button - always enabled
    // Rest button - always enabled

    Debug.logInfo('Action buttons updated');
  } catch (err) {
    Debug.logError('Failed to update action buttons', err);
  }
}

/**
 * Render all UI components
 */
function renderAll() {
  renderStatusIcons();
  renderPigeonName();
  renderStatusMessage();
  updatePigeonSprite();
  updateActionButtons();
}

/**
 * Show modal
 */
function showModal(modalId) {
  try {
    const modal = elements[modalId];
    if (modal) {
      modal.classList.remove('hidden');
      Debug.logInfo(`Showing modal: ${modalId}`);
    }
  } catch (err) {
    Debug.logError(`Failed to show modal: ${modalId}`, err);
  }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
  try {
    const modal = elements[modalId];
    if (modal) {
      modal.classList.add('hidden');
      Debug.logInfo(`Hiding modal: ${modalId}`);
    }
  } catch (err) {
    Debug.logError(`Failed to hide modal: ${modalId}`, err);
  }
}

/**
 * Handle Feed action
 */
function handleFeed() {
  try {
    const state = State.getState();
    const pigeon = state.pigeon;

    // Restore 20 energy (capped at 100)
    const newEnergy = Math.min(100, pigeon.energy + 20);
    State.updatePigeon({ energy: newEnergy });

    // Refresh mood
    State.refreshMood();

    // Brief happy animation
    elements.pigeonSprite?.setAttribute('data-state', 'happy');
    setTimeout(() => {
      updatePigeonSprite();
    }, 1000);

    renderAll();

    Debug.logInfo('Fed pigeon', { newEnergy });
  } catch (err) {
    Debug.logError('Failed to feed pigeon', err);
  }
}

/**
 * Handle Rest action
 */
function handleRest() {
  try {
    // Restore 10 energy (capped at 100)
    const state = State.getState();
    const newEnergy = Math.min(100, state.pigeon.energy + 10);
    State.updatePigeon({ energy: newEnergy });

    // Refresh mood
    State.refreshMood();

    renderAll();

    Debug.logInfo('Pigeon rested', { newEnergy });
  } catch (err) {
    Debug.logError('Failed to rest pigeon', err);
  }
}

/**
 * Handle Write action (open ritual modal)
 */
function handleWrite() {
  try {
    const state = State.getState();

    // Check energy
    if (state.pigeon.energy < 20) {
      alert('Your pigeon is too tired to carry a message. Let them rest first!');
      return;
    }

    // Check if already has scroll
    if (currentDraft !== null) {
      alert('Your pigeon is already carrying a message!');
      return;
    }

    // Check daily limit
    if (state.session.dailyMessagesUsed >= state.session.dailyLimit) {
      alert('Daily message limit reached! Reset your session to send more.');
      return;
    }

    // Clear form
    if (elements.inputFromArea) elements.inputFromArea.value = '';
    if (elements.inputToArea) elements.inputToArea.value = '';
    if (elements.inputMessage) elements.inputMessage.value = '';
    if (elements.charCount) elements.charCount.textContent = '0';

    showModal('ritualOverlay');

    Debug.logInfo('Write ritual opened');
  } catch (err) {
    Debug.logError('Failed to handle write', err);
  }
}

/**
 * Handle Attach Scroll (from ritual modal)
 */
async function handleAttachScroll() {
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

    if (!/^\d{3}$/.test(fromArea) || !/^\d{3}$/.test(toArea)) {
      alert('Area codes must contain only numbers');
      return;
    }

    Debug.logInfo('Attaching scroll', { fromArea, toArea });

    // Fetch weather
    currentWeather = await Weather.getRouteWeather(fromArea, toArea);

    // Create draft
    currentDraft = {
      fromAreaCode: fromArea,
      toAreaCode: toArea,
      body: messageBody,
      weather: currentWeather,
    };

    // Show scroll on pigeon
    if (elements.messageScroll) {
      elements.messageScroll.classList.remove('hidden');
    }

    if (elements.scrollText) {
      const preview = messageBody.length > 30
        ? messageBody.substring(0, 30) + '...'
        : messageBody;
      elements.scrollText.textContent = preview;
    }

    // Close ritual modal
    hideModal('ritualOverlay');

    // Update UI
    renderAll();

    Debug.logInfo('Scroll attached', currentDraft);
  } catch (err) {
    Debug.logError('Failed to attach scroll', err);
    alert('Failed to attach scroll. Check debug panel for details.');
  }
}

/**
 * Handle Send action (flight animation)
 */
function handleSend() {
  try {
    if (!currentDraft) {
      alert('No message to send! Write a message first.');
      return;
    }

    const state = State.getState();

    // Calculate delivery time
    const distance = Weather.calculateDistance(currentDraft.fromAreaCode, currentDraft.toAreaCode);
    const weatherMultiplier = currentDraft.weather?.delayMultiplier || 1.0;
    const delivery = Weather.calculateDelivery(distance, weatherMultiplier);
    const scheduledDeliveryAt = Date.now() + (delivery.delayedMinutes * 60 * 1000);

    // Add message to state
    const message = State.addMessage({
      fromAreaCode: currentDraft.fromAreaCode,
      toAreaCode: currentDraft.toAreaCode,
      body: currentDraft.body,
      scheduledDeliveryAt,
    });

    // Consume energy
    State.consumeEnergy(15);

    // Add XP
    State.addXP(10);

    // Animate pigeon flying away
    if (elements.pigeonSprite) {
      elements.pigeonSprite.setAttribute('data-state', 'flying');
    }

    // Hide scroll
    setTimeout(() => {
      if (elements.messageScroll) {
        elements.messageScroll.classList.add('hidden');
      }
    }, 500);

    // After 2 seconds, set to "gone"
    setTimeout(() => {
      if (elements.pigeonSprite) {
        elements.pigeonSprite.setAttribute('data-state', 'gone');
      }
      if (elements.statusMessage) {
        elements.statusMessage.textContent = `Flying to area code ${currentDraft.toAreaCode}... ETA: ${delivery.delayedMinutes} min`;
      }
    }, 2000);

    // Simulate return after delivery time
    setTimeout(() => {
      // Pigeon returns
      if (elements.pigeonSprite) {
        elements.pigeonSprite.setAttribute('data-state', 'returning');
      }

      setTimeout(() => {
        updatePigeonSprite();
        renderAll();
        alert(`Message delivered! Your pigeon has returned.`);
      }, 2000);
    }, delivery.delayedMinutes * 60 * 1000);

    // Clear draft
    currentDraft = null;

    // Update UI
    renderAll();

    Debug.logInfo('Message sent', message);
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
    showModal('modalHistory');
    Debug.logInfo('History modal opened');
  } catch (err) {
    Debug.logError('Failed to handle view history', err);
  }
}

/**
 * Render message history
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
      }
    });

    Debug.logInfo(`Rendered ${messages.length} messages`);
  } catch (err) {
    Debug.logError('Failed to render message history', err);
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

    showModal('modalEdit');
    Debug.logInfo('Edit pigeon modal opened');
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

    hideModal('modalEdit');
    renderAll();

    Debug.logInfo('Pigeon saved', { name, color });
  } catch (err) {
    Debug.logError('Failed to save pigeon', err);
  }
}

/**
 * Handle Reset Session
 */
function handleResetSession() {
  try {
    const confirmed = confirm('Reset daily session? This will reset message count.');

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
 * Update character count
 */
function updateCharCount() {
  try {
    const message = elements.inputMessage?.value || '';
    if (elements.charCount) {
      elements.charCount.textContent = message.length.toString();
    }
  } catch (err) {
    Debug.logError('Failed to update char count', err);
  }
}

/**
 * Set up all event handlers
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
        case 'feed':
          handleFeed();
          break;
        case 'write':
          handleWrite();
          break;
        case 'send':
          handleSend();
          break;
        case 'rest':
          handleRest();
          break;
        case 'attach-scroll':
          handleAttachScroll();
          break;
        case 'close-ritual':
          hideModal('ritualOverlay');
          break;
        case 'view-history':
          handleViewHistory();
          break;
        case 'close-history':
          hideModal('modalHistory');
          break;
        case 'edit-pigeon':
          handleEditPigeon();
          break;
        case 'save-pigeon':
          handleSavePigeon();
          break;
        case 'close-edit':
          hideModal('modalEdit');
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

  // Character count for textarea
  if (elements.inputMessage) {
    elements.inputMessage.addEventListener('input', updateCharCount);
  }

  Debug.logLifecycle('Event handlers installed');
}

/**
 * Cache DOM elements
 */
function cacheElements() {
  elements = {
    app: document.getElementById('app'),
    pigeonName: document.getElementById('pigeonName'),
    pigeonSprite: document.getElementById('pigeonSprite'),
    messageScroll: document.getElementById('messageScroll'),
    scrollText: document.getElementById('scrollText'),
    statusMessage: document.getElementById('statusMessage'),
    iconEnergy: document.getElementById('iconEnergy'),
    iconMood: document.getElementById('iconMood'),
    iconLevel: document.getElementById('iconLevel'),
    btnFeed: document.getElementById('btnFeed'),
    btnWrite: document.getElementById('btnWrite'),
    btnSend: document.getElementById('btnSend'),
    btnRest: document.getElementById('btnRest'),
    ritualOverlay: document.getElementById('ritualOverlay'),
    inputFromArea: document.getElementById('inputFromArea'),
    inputToArea: document.getElementById('inputToArea'),
    inputMessage: document.getElementById('inputMessage'),
    charCount: document.getElementById('charCount'),
    modalHistory: document.getElementById('modalHistory'),
    historyList: document.getElementById('historyList'),
    modalEdit: document.getElementById('modalEdit'),
    inputPigeonName: document.getElementById('inputPigeonName'),
    inputPigeonColor: document.getElementById('inputPigeonColor'),
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
