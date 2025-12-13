import {
  addMessage,
  getState,
  hardResetAll,
  resetSession,
  setPigeonProfile,
  subscribe,
  toggleEditMode,
  touchAction,
  buildId,
} from './v2-state.js';
import { initDebugPanel, runInterceptScan } from './v2-debug.js';
import { fetchWeather } from './v2-weather.js';

const debug = initDebugPanel();

document.addEventListener('DOMContentLoaded', () => {
  debug.log('App mounted, binding handlers');
  debug.markMounted();
  const onlineChip = document.querySelector('#onlineChip');
  if (!navigator.onLine) {
    onlineChip.textContent = 'Offline';
    onlineChip.classList.remove('chip-on');
  }

  const refs = {
    nameInput: document.querySelector('#pigeonNameInput'),
    colorInput: document.querySelector('#pigeonColorInput'),
    lastAction: document.querySelector('#lastAction'),
    messageHistory: document.querySelector('#messageHistory'),
    historyContent: document.querySelector('#historyContent'),
    weatherLocation: document.querySelector('#weatherLocation'),
    weatherStatus: document.querySelector('#weatherStatus'),
    weatherTemp: document.querySelector('#weatherTemp'),
    weatherMock: document.querySelector('#weatherMock'),
    weatherUpdated: document.querySelector('#weatherUpdated'),
    overlayIndicator: document.querySelector('#overlayIndicator'),
  };

  function updateLastAction(label) {
    refs.lastAction.textContent = `Last Action: ${label} @ ${new Date().toLocaleTimeString()}`;
  }

  function render(state) {
    refs.nameInput.value = state.pigeon.name;
    refs.colorInput.value = state.pigeon.signatureColor;
    refs.weatherLocation.value = state.weather.location;
    refs.weatherStatus.value = state.weather.status;
    refs.weatherTemp.value = state.weather.tempF ? `${state.weather.tempF}` : '';
    refs.weatherMock.value = state.weather.usingMock ? 'Using Mock' : 'Live API';
    refs.weatherUpdated.textContent = state.weather.lastCheckedAt
      ? `Updated ${new Date(state.weather.lastCheckedAt).toLocaleTimeString()}`
      : 'No checks yet.';
    updateMessageLists(state.messages);
    if (state.session.lastActionAt) {
      refs.lastAction.textContent = `Last Action: ${state.session.lastActionLabel || 'Action'} @ ${new Date(
        state.session.lastActionAt,
      ).toLocaleTimeString()}`;
    }
  }

  function updateMessageLists(messages) {
    const nodes = messages.map((msg) => {
      const li = document.createElement('li');
      li.className = 'message-card';
      li.innerHTML = `<strong>${msg.from || 'Unknown'} → ${msg.to || 'Unknown'}</strong><br />${msg.body}<br /><small>${new Date(
        msg.createdAt,
      ).toLocaleTimeString()}</small>`;
      return li;
    });

    refs.messageHistory.innerHTML = '';
    refs.historyContent.innerHTML = '';
    nodes.slice(0, 3).forEach((node) => refs.messageHistory.appendChild(node.cloneNode(true)));
    nodes.forEach((node) => refs.historyContent.appendChild(node));
  }

  const unsubscribe = subscribe(render);
  render(getState());

  function withAction(label, handler) {
    return async (event) => {
      event?.preventDefault?.();
      debug.log(`Button ${label} fired`);
      console.log(`Button ${label} fired`);
      updateLastAction(label);
      touchAction(label);
      try {
        await handler(event);
      } catch (err) {
        debug.error(`${label} failed: ${err.message || err}`);
      }
    };
  }

  document.querySelector('#saveIdentity').addEventListener(
    'click',
    withAction('Save Identity', () => {
      setPigeonProfile({
        name: refs.nameInput.value || 'Sky Courier',
        signatureColor: refs.colorInput.value,
      });
      debug.log('Identity saved to state & storage');
    }),
  );

  document.querySelector('#toggleEdit').addEventListener(
    'click',
    withAction('Toggle Edit Mode', () => {
      const next = toggleEditMode();
      debug.log(`Edit mode: ${next.session.editMode}`);
    }),
  );

  document.querySelector('#resetSession').addEventListener(
    'click',
    withAction('Reset Session', () => {
      resetSession();
      debug.log('Session reset (daily limit cleared)');
    }),
  );

  document.querySelector('#openMessages').addEventListener(
    'click',
    withAction('Open Messages', () => {
      document.querySelector('#messagesPanel').scrollIntoView({ behavior: 'smooth' });
      debug.log('Messages panel focused');
    }),
  );

  const historyPanel = document.querySelector('#historyPanel');
  let historyVisible = true;
  document.querySelector('#toggleHistory').addEventListener(
    'click',
    withAction('Toggle History', () => {
      historyVisible = !historyVisible;
      historyPanel.style.display = historyVisible ? 'block' : 'none';
      debug.log(`History visibility: ${historyVisible}`);
    }),
  );

  document.querySelector('#sendMessage').addEventListener(
    'click',
    withAction('Send Message', () => {
      const payload = {
        id: crypto.randomUUID(),
        to: document.querySelector('#msgTo').value || 'Friend',
        from: document.querySelector('#msgFrom').value || 'You',
        body: document.querySelector('#msgBody').value || 'Empty body',
        createdAt: new Date().toISOString(),
      };
      addMessage(payload);
      debug.log(`Message sent ${payload.id}`);
    }),
  );

  document.querySelector('#clearInputs').addEventListener(
    'click',
    withAction('Clear Inputs', () => {
      document.querySelector('#msgTo').value = '';
      document.querySelector('#msgFrom').value = '';
      document.querySelector('#msgBody').value = '';
    }),
  );

  document.querySelector('#checkWeatherBtn').addEventListener(
    'click',
    withAction('Check Weather', async () => {
      const location = refs.weatherLocation.value || 'Seattle';
      const result = await fetchWeather(location);
      debug.log(`Weather checked for ${location} (mock=${result.usingMock})`);
    }),
  );

  document.querySelector('#scanIntercepts').addEventListener(
    'click',
    withAction('Scan Intercepts', () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const results = runInterceptScan(buttons, debug.log, debug.error);
      const intercepted = results.some((r) => r.intercepted);
      refs.overlayIndicator.textContent = intercepted ? 'Overlay detected! check errors' : 'No overlays intercepting clicks';
    }),
  );

  document.querySelector('#triggerError').addEventListener(
    'click',
    withAction('Trigger Error', () => {
      throw new Error('Intentional test error from V2 UI');
    }),
  );

  document.querySelector('#hardReset').addEventListener(
    'click',
    withAction('Hard Reset', () => {
      const restored = hardResetAll();
      render(restored);
      debug.log('Hard reset completed, state returned to defaults');
    }),
  );

  refs.overlayIndicator.textContent = 'Ready to scan overlays';
  debug.log(`Build ${buildId} ready`);
});
