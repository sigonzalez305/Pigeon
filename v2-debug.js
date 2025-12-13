import { addDebugError, addDebugLog, storageHealthy } from './v2-state.js';

function createLogEntry(prefix, message) {
  const time = new Date().toLocaleTimeString();
  return `[${time}] ${prefix} ${message}`;
}

function appendLine(listEl, text, type = 'log') {
  const li = document.createElement('li');
  li.textContent = text;
  li.className = type;
  listEl.appendChild(li);
  while (listEl.children.length > 50) {
    listEl.removeChild(listEl.firstChild);
  }
}

export function initDebugPanel() {
  const logList = document.querySelector('#debugLog');
  const errorList = document.querySelector('#errorLog');
  const overlayIndicator = document.querySelector('#overlayIndicator');
  const storageChip = document.querySelector('[data-chip="storage"]');
  const mountedChip = document.querySelector('[data-chip="mounted"]');

  storageChip.textContent = storageHealthy() ? 'Storage OK' : 'Storage blocked';

  const api = {
    log: (message) => {
      const entry = createLogEntry('LOG', message);
      appendLine(logList, entry, 'log');
      addDebugLog(entry);
      console.log(entry);
    },
    error: (message) => {
      const entry = createLogEntry('ERR', message);
      appendLine(errorList, entry, 'error');
      addDebugError(entry);
      console.error(entry);
    },
    markMounted: () => {
      mountedChip.textContent = 'Mounted';
      mountedChip.classList.add('chip-on');
    },
    setOverlayStatus: (text) => {
      overlayIndicator.textContent = text;
    },
  };

  window.onerror = function onWindowError(msg, url, line, col, err) {
    api.error(`window.onerror: ${msg} at ${url}:${line}:${col} ${(err && err.stack) || ''}`);
  };

  window.onunhandledrejection = function onUnhandled(event) {
    api.error(`Unhandled rejection: ${event.reason}`);
  };

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      const closestButton = target.closest('button, [role="button"], a');
      const targetInfo = `${target.tagName.toLowerCase()}${target.id ? '#' + target.id : ''}${target.className ? '.' + target.className.toString().replace(/\s+/g, '.') : ''}`;
      const pointerEvents = window.getComputedStyle(target).pointerEvents;
      const closestPointerEvents = closestButton ? window.getComputedStyle(closestButton).pointerEvents : 'n/a';
      const detail = {
        defaultPrevented: event.defaultPrevented,
        targetInfo,
        closestButton: closestButton?.id || closestButton?.textContent?.trim() || 'none',
        pointerEvents,
        closestPointerEvents,
      };
      api.log(`Global click captured: ${JSON.stringify(detail)}`);
    },
    true,
  );

  return api;
}

export function runInterceptScan(buttons, logFn, errorFn) {
  const results = buttons.map((btn) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const element = document.elementFromPoint(cx, cy);
    const intercepted = element && !btn.contains(element);
    let blockerDescription = 'none';
    if (intercepted) {
      const styles = window.getComputedStyle(element);
      blockerDescription = `${element.tagName.toLowerCase()}#${element.id || 'unknown'}.${element.className || 'none'} :: position=${styles.position}, z-index=${styles.zIndex}, pointer-events=${styles.pointerEvents}, opacity=${styles.opacity}`;
    }
    return {
      id: btn.id || btn.textContent?.trim() || 'button',
      intercepted,
      blockerDescription,
    };
  });

  results.forEach((result) => {
    if (result.intercepted) {
      errorFn(`INTERCEPTED ${result.id}: ${result.blockerDescription}`);
    } else {
      logFn(`No interception detected for ${result.id}`);
    }
  });

  return results;
}
