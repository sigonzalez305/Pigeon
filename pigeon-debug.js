/**
 * PIGEON - Debug Panel Module
 *
 * Captures errors, logs interactions, and surfaces app state.
 * Always visible in dev mode. Never blocks app functionality.
 */

const MAX_LOG_ENTRIES = 50;
const logs = [];
let debugPanel = null;
let logContainer = null;

/**
 * Log levels
 */
const LogLevel = {
  INFO: 'info',
  CLICK: 'click',
  ERROR: 'error',
  WARNING: 'warning',
  LIFECYCLE: 'lifecycle',
};

/**
 * Add log entry
 */
function addLog(level, message, data = null) {
  const entry = {
    timestamp: Date.now(),
    level,
    message,
    data,
  };

  logs.unshift(entry);

  // Keep only recent logs
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.pop();
  }

  renderLogs();
}

/**
 * Format timestamp
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Render logs to debug panel
 */
function renderLogs() {
  if (!logContainer) return;

  try {
    logContainer.innerHTML = '';

    logs.forEach(entry => {
      const logEntry = document.createElement('div');
      logEntry.className = `debug-log-entry debug-log-${entry.level}`;

      const time = document.createElement('span');
      time.className = 'debug-log-time';
      time.textContent = formatTime(entry.timestamp);

      const level = document.createElement('span');
      level.className = 'debug-log-level';
      level.textContent = entry.level.toUpperCase();

      const message = document.createElement('span');
      message.className = 'debug-log-message';
      message.textContent = entry.message;

      logEntry.appendChild(time);
      logEntry.appendChild(level);
      logEntry.appendChild(message);

      if (entry.data) {
        const data = document.createElement('pre');
        data.className = 'debug-log-data';
        try {
          data.textContent = JSON.stringify(entry.data, null, 2);
        } catch (err) {
          data.textContent = String(entry.data);
        }
        logEntry.appendChild(data);
      }

      logContainer.appendChild(logEntry);
    });
  } catch (err) {
    console.error('Failed to render logs:', err);
  }
}

/**
 * Create debug panel UI
 */
export function createDebugPanel() {
  debugPanel = document.createElement('div');
  debugPanel.id = 'debug-panel';
  debugPanel.className = 'debug-panel';

  const header = document.createElement('div');
  header.className = 'debug-header';
  header.innerHTML = '<strong>🐛 Debug Panel</strong>';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'debug-clear-btn';
  clearBtn.textContent = 'Clear';
  clearBtn.onclick = () => {
    logs.length = 0;
    renderLogs();
  };

  header.appendChild(clearBtn);

  logContainer = document.createElement('div');
  logContainer.className = 'debug-log-container';

  debugPanel.appendChild(header);
  debugPanel.appendChild(logContainer);

  document.body.appendChild(debugPanel);

  addLog(LogLevel.LIFECYCLE, 'Debug panel initialized');

  return debugPanel;
}

/**
 * Log info message
 */
export function logInfo(message, data) {
  addLog(LogLevel.INFO, message, data);
}

/**
 * Log click event
 */
export function logClick(target, action) {
  const message = `Button clicked: ${action || 'unknown'}`;
  addLog(LogLevel.CLICK, message, {
    target: target?.tagName,
    id: target?.id,
    className: target?.className,
  });
}

/**
 * Log error
 */
export function logError(message, error) {
  addLog(LogLevel.ERROR, message, {
    error: error?.message,
    stack: error?.stack,
  });
  console.error(message, error);
}

/**
 * Log warning
 */
export function logWarning(message, data) {
  addLog(LogLevel.WARNING, message, data);
}

/**
 * Log lifecycle event
 */
export function logLifecycle(message, data) {
  addLog(LogLevel.LIFECYCLE, message, data);
}

/**
 * Install global error handlers
 */
export function installErrorHandlers() {
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    logError(`Unhandled error: ${event.message}`, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(`Unhandled promise rejection: ${event.reason}`, {
      reason: event.reason,
      promise: event.promise,
    });
  });

  // CSP violation reporting
  document.addEventListener('securitypolicyviolation', (event) => {
    logError('CSP Violation', {
      violatedDirective: event.violatedDirective,
      effectiveDirective: event.effectiveDirective,
      blockedURI: event.blockedURI,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
    });
  });

  logLifecycle('Global error handlers installed');
}

/**
 * Install click capture logging
 * Logs ALL clicks at capture phase to prove events are firing
 */
export function installClickLogger() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      const isButton = target.tagName === 'BUTTON' || target.closest('button');

      if (isButton) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const action = button.dataset.action || button.textContent || 'unknown';
        logClick(button, action);
      }
    },
    true // capture phase
  );

  logLifecycle('Click capture logger installed');
}

/**
 * Log state snapshot
 */
export function logStateSnapshot(state) {
  logInfo('State snapshot', {
    pigeon: {
      name: state.pigeon?.name,
      level: state.pigeon?.level,
      xp: state.pigeon?.xp,
      energy: state.pigeon?.energy,
      mood: state.pigeon?.mood,
    },
    session: {
      dailyMessagesUsed: state.session?.dailyMessagesUsed,
      dailyLimit: state.session?.dailyLimit,
      editMode: state.session?.editMode,
    },
    messageCount: state.messages?.length || 0,
  });
}

/**
 * Initialize debug system
 */
export function initDebug() {
  createDebugPanel();
  installErrorHandlers();
  installClickLogger();
  logLifecycle('Debug system fully initialized');
}

/**
 * Export logs for external use
 */
export function exportLogs() {
  return [...logs];
}
