import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosError } from 'axios';
import { AREA_CODE_CENTROIDS } from '../data/areaCodeCentroids';
import { distanceMiles, resolveAreaCodeLocation, type RouteLocation } from '../services/location';
import { useConversationStore } from '../store/conversationStore';

/**
 * An in-browser stand-in for the Spring Boot API, used only in demo mode.
 *
 * It answers the same routes with the same shapes and error codes as the real
 * controllers, so the screens cannot tell the difference and nothing in them is
 * special-cased for the demo. State lives in localStorage: one browser is one
 * little world, and nothing is shared between devices.
 */

type DemoUser = { id: number; phone: string; displayName: string; password: string };
type DemoMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  clientNonce?: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
};
type DemoConversation = { id: number; participantIds: [number, number]; updatedAt: string };
type DemoFlight = {
  id: number;
  senderId: number;
  messageId: number;
  conversationId: number;
  pigeonName: string;
  recipientPhone: string;
  messageBody: string;
  origin: RouteLocation;
  destination: RouteLocation;
  distanceMiles: number;
  launchAt: number;
  arrivalAt: number;
  state: 'flying' | 'delivered';
  day: string;
};
type DemoState = {
  nextId: number;
  users: DemoUser[];
  conversations: DemoConversation[];
  messages: DemoMessage[];
  flights: DemoFlight[];
};

const STORAGE_KEY = 'pigeon.demo.v1';
const DAILY_LIMIT = 1;
/** Flights are compressed so a whole journey can be watched in about a minute. */
const MIN_FLIGHT_MS = 45_000;
const MAX_FLIGHT_MS = 90_000;

const digits = (phone: string) => {
  const d = phone.replace(/\D/g, '');
  return d.length === 11 && d.startsWith('1') ? d.slice(1) : d;
};

const today = () => new Date().toISOString().slice(0, 10);

const seed = (): DemoState => {
  const now = Date.now();
  const iso = (minutesAgo: number) => new Date(now - minutesAgo * 60_000).toISOString();
  return {
    nextId: 100,
    users: [
      { id: 1, phone: '+12025550111', displayName: 'Alice', password: 'password' },
      { id: 2, phone: '+13055550178', displayName: 'Bob', password: 'password' },
      { id: 3, phone: '+14155550142', displayName: 'Charlie', password: 'password' },
    ],
    conversations: [
      { id: 10, participantIds: [1, 2], updatedAt: iso(42) },
      { id: 11, participantIds: [1, 3], updatedAt: iso(300) },
      { id: 12, participantIds: [2, 3], updatedAt: iso(900) },
    ],
    messages: [
      { id: 20, conversationId: 10, senderId: 2, body: 'Did the pigeon make it past the storm?', createdAt: iso(60), status: 'read' },
      { id: 21, conversationId: 10, senderId: 1, body: 'Landed safe. Pico wants sunflower seeds.', createdAt: iso(55), status: 'read' },
      { id: 22, conversationId: 10, senderId: 2, body: 'Send him back with a scroll when you can.', createdAt: iso(42), status: 'delivered' },
      { id: 23, conversationId: 11, senderId: 3, body: 'Fog over the bay again. Flights are slow today.', createdAt: iso(300), status: 'read' },
      { id: 24, conversationId: 12, senderId: 3, body: 'Coop Town looks good at dusk.', createdAt: iso(900), status: 'read' },
    ],
    flights: [],
  };
};

let memory: DemoState | null = null;

const load = (): DemoState => {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    memory = raw ? (JSON.parse(raw) as DemoState) : seed();
  } catch {
    memory = seed();
  }
  return memory;
};

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Storage can be blocked or full. The demo keeps working from memory.
  }
};

/** Wipes the demo world back to its seeded state. */
export const resetDemoData = () => {
  memory = seed();
  save();
};

const publicUser = (user: DemoUser) => ({ id: user.id, phone: user.phone, displayName: user.displayName });

const tokenFor = (user: DemoUser) => `demo-${user.id}`;

const currentUser = (config: InternalAxiosRequestConfig, state: DemoState): DemoUser | null => {
  const header = String(config.headers?.Authorization ?? '') || `Bearer ${localStorage.getItem('token') ?? ''}`;
  const match = /demo-(\d+)/.exec(header);
  return match ? state.users.find((user) => user.id === Number(match[1])) ?? null : null;
};

const usedToday = (state: DemoState, senderId: number) =>
  state.flights.filter((flight) => flight.senderId === senderId && flight.day === today()).length;

const flightView = (state: DemoState, flight: DemoFlight) => ({
  id: flight.id,
  messageId: flight.messageId,
  conversationId: flight.conversationId,
  pigeonName: flight.pigeonName,
  recipientPhone: flight.recipientPhone,
  messageBody: flight.messageBody,
  origin: flight.origin,
  destination: flight.destination,
  distanceMiles: flight.distanceMiles,
  launchAt: flight.launchAt,
  arrivalAt: flight.arrivalAt,
  state: flight.state,
  dailyRemaining: Math.max(0, DAILY_LIMIT - usedToday(state, flight.senderId)),
});

const conversationView = (state: DemoState, conversation: DemoConversation, viewerId: number) => {
  const thread = state.messages.filter((message) => message.conversationId === conversation.id);
  const otherId = conversation.participantIds.find((id) => id !== viewerId) ?? viewerId;
  const other = state.users.find((user) => user.id === otherId);
  return {
    id: conversation.id,
    // The viewer first, so the other participant is always at index 1.
    participantIds: [viewerId, otherId],
    title: other?.displayName,
    lastMessage: thread[thread.length - 1],
    unreadCount: thread.filter((message) => message.senderId !== viewerId && message.status !== 'read').length,
    updatedAt: conversation.updatedAt,
  };
};

const findOrCreateConversation = (state: DemoState, a: number, b: number): DemoConversation => {
  const existing = state.conversations.find(
    (conversation) => conversation.participantIds.includes(a) && conversation.participantIds.includes(b),
  );
  if (existing) return existing;
  const created: DemoConversation = { id: state.nextId++, participantIds: [a, b], updatedAt: new Date().toISOString() };
  state.conversations.push(created);
  return created;
};

class DemoHttpError extends Error {
  constructor(public status: number, public data: unknown) {
    super(`demo ${status}`);
  }
}

const REPLIES = [
  'Got it. The loft is listening.',
  'Scroll received. Pico says hello.',
  'Read it twice. Worth the wait.',
  'Noted. Send the bird back when you can.',
];

/** Things a real server would push over the WebSocket, faked with timers. */
const simulateDelivery = (message: DemoMessage, replierId: number) => {
  const later = (ms: number, run: () => void) => window.setTimeout(run, ms);
  const store = () => useConversationStore.getState();

  const setStatus = (status: DemoMessage['status']) => {
    const state = load();
    const stored = state.messages.find((candidate) => candidate.id === message.id);
    if (!stored) return;
    stored.status = status;
    save();
    store().updateMessageStatus(message.id, status);
  };

  later(700, () => setStatus('delivered'));
  later(2200, () => setStatus('read'));
  later(3800, () => {
    const state = load();
    const reply: DemoMessage = {
      id: state.nextId++,
      conversationId: message.conversationId,
      senderId: replierId,
      body: REPLIES[message.id % REPLIES.length],
      createdAt: new Date().toISOString(),
      status: 'read',
    };
    state.messages.push(reply);
    const conversation = state.conversations.find((candidate) => candidate.id === message.conversationId);
    if (conversation) conversation.updatedAt = reply.createdAt;
    save();
    store().addMessage(reply);
  });
};

const route = (config: InternalAxiosRequestConfig): unknown => {
  const state = load();
  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').replace(/^https?:\/\/[^/]+/, '').replace(/\?.*$/, '');
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data ?? {};

  if (method === 'post' && path === '/api/auth/login') {
    const user = state.users.find((candidate) => digits(candidate.phone) === digits(body.phone ?? ''));
    if (!user || user.password !== body.password) throw new DemoHttpError(401, 'Invalid phone number or password');
    return { token: tokenFor(user), user: publicUser(user) };
  }

  if (method === 'post' && path === '/api/auth/register') {
    const national = digits(body.phone ?? '');
    if (national.length !== 10) throw new DemoHttpError(400, 'Enter a 10-digit U.S. phone number');
    if (state.users.some((candidate) => digits(candidate.phone) === national)) {
      throw new DemoHttpError(400, 'That phone number is already registered');
    }
    const user: DemoUser = {
      id: state.nextId++,
      phone: `+1${national}`,
      displayName: String(body.displayName ?? 'New keeper'),
      password: String(body.password ?? ''),
    };
    state.users.push(user);
    save();
    return { token: tokenFor(user), user: publicUser(user) };
  }

  const me = currentUser(config, state);
  if (!me) throw new DemoHttpError(401, { code: 'unknown_sender', message: 'That account no longer exists.' });

  if (method === 'get' && path === '/api/auth/me') return publicUser(me);

  if (method === 'get' && path === '/api/conversations') {
    return state.conversations
      .filter((conversation) => conversation.participantIds.includes(me.id))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((conversation) => conversationView(state, conversation, me.id));
  }

  const thread = /^\/api\/conversations\/(\d+)\/messages$/.exec(path);
  if (thread) {
    const conversationId = Number(thread[1]);
    const conversation = state.conversations.find((candidate) => candidate.id === conversationId);
    if (!conversation || !conversation.participantIds.includes(me.id)) throw new DemoHttpError(404, 'Conversation not found');

    if (method === 'get') {
      // Opening a thread reads it.
      state.messages.forEach((message) => {
        if (message.conversationId === conversationId && message.senderId !== me.id) message.status = 'read';
      });
      save();
      return state.messages.filter((message) => message.conversationId === conversationId);
    }

    if (method === 'post') {
      const message: DemoMessage = {
        id: state.nextId++,
        conversationId,
        senderId: me.id,
        body: String(body.body ?? ''),
        clientNonce: body.clientNonce,
        createdAt: new Date().toISOString(),
        status: 'sent',
      };
      state.messages.push(message);
      conversation.updatedAt = message.createdAt;
      save();
      const otherId = conversation.participantIds.find((id) => id !== me.id) ?? me.id;
      simulateDelivery(message, otherId);
      return message;
    }
  }

  if (method === 'get' && path === '/api/pigeons/party') {
    return [{ id: me.id * 10 + 1, name: 'Pico', spriteKey: 'pico-blue-bar', level: 3, mood: 'happy', energy: 100, trait: 'Curious' }];
  }

  if (method === 'put' && /^\/api\/pigeons\/\d+\/activate$/.test(path)) return {};

  if (method === 'get' && path === '/api/pigeon-messages/active') {
    const active = state.flights.find((flight) => flight.senderId === me.id && flight.state === 'flying');
    return {
      activeFlight: active ? flightView(state, active) : null,
      dailyRemaining: Math.max(0, DAILY_LIMIT - usedToday(state, me.id)),
    };
  }

  if (method === 'post' && path === '/api/pigeon-messages') {
    const repeat = state.messages.find((message) => message.clientNonce && message.clientNonce === body.clientNonce);
    if (repeat) {
      const existing = state.flights.find((flight) => flight.messageId === repeat.id);
      if (existing) return flightView(state, existing);
    }

    const recipientDigits = digits(String(body.recipientPhone ?? ''));
    if (recipientDigits.length !== 10) {
      throw new DemoHttpError(400, { code: 'invalid_recipient', message: 'That does not look like a U.S. phone number.' });
    }
    if (recipientDigits === digits(me.phone)) {
      throw new DemoHttpError(400, { code: 'self_send', message: 'A pigeon cannot deliver a scroll to its own coop. Pick someone else.' });
    }
    if (usedToday(state, me.id) >= DAILY_LIMIT) {
      throw new DemoHttpError(429, {
        code: 'daily_limit_reached',
        message: "Today's Pigeon Message has already flown. In this demo you can reset it from Profile.",
      });
    }

    const destination = resolveAreaCodeLocation(recipientDigits, AREA_CODE_CENTROIDS);
    const origin: RouteLocation | null = body.origin ?? resolveAreaCodeLocation(me.phone, AREA_CODE_CENTROIDS);
    if (!destination || !origin) {
      throw new DemoHttpError(400, { code: 'unroutable', message: 'We could not work out a route for that area code.' });
    }

    // The real server refuses numbers that are not on Pigeon. A demo with three
    // accounts would refuse nearly everything, so an unknown number gets a
    // keeper created for it on the spot.
    let recipient = state.users.find((candidate) => digits(candidate.phone) === recipientDigits);
    if (!recipient) {
      recipient = {
        id: state.nextId++,
        phone: `+1${recipientDigits}`,
        displayName: `Keeper in ${destination.displayRegion}`,
        password: 'password',
      };
      state.users.push(recipient);
    }

    const conversation = findOrCreateConversation(state, me.id, recipient.id);
    const nowIso = new Date().toISOString();
    const message: DemoMessage = {
      id: state.nextId++,
      conversationId: conversation.id,
      senderId: me.id,
      body: String(body.body ?? ''),
      clientNonce: body.clientNonce,
      createdAt: nowIso,
      status: 'sent',
    };
    state.messages.push(message);
    conversation.updatedAt = nowIso;

    const miles = distanceMiles(origin, destination);
    const weather = Number(body.weatherMultiplier) > 0 ? Number(body.weatherMultiplier) : 1;
    const base = MIN_FLIGHT_MS + (Math.min(miles, 2800) / 2800) * (MAX_FLIGHT_MS - MIN_FLIGHT_MS);
    const launchAt = Date.now();
    const flight: DemoFlight = {
      id: state.nextId++,
      senderId: me.id,
      messageId: message.id,
      conversationId: conversation.id,
      pigeonName: String(body.pigeonName ?? 'Pico'),
      recipientPhone: recipient.phone,
      messageBody: message.body,
      origin,
      destination,
      distanceMiles: miles,
      launchAt,
      arrivalAt: launchAt + Math.round(base * weather),
      state: 'flying',
      day: today(),
    };
    state.flights.push(flight);
    save();
    return flightView(state, flight);
  }

  const arrive = /^\/api\/pigeon-messages\/(\d+)\/arrive$/.exec(path);
  if (method === 'post' && arrive) {
    const flight = state.flights.find((candidate) => candidate.id === Number(arrive[1]) && candidate.senderId === me.id);
    if (!flight) throw new DemoHttpError(404, { code: 'flight_not_found', message: 'No such flight.' });
    if (flight.state === 'flying' && Date.now() >= flight.arrivalAt) {
      flight.state = 'delivered';
      const message = state.messages.find((candidate) => candidate.id === flight.messageId);
      if (message) message.status = 'delivered';
      save();
    }
    return flightView(state, flight);
  }

  if (method === 'post' && path === '/api/pigeon-messages/reset-daily') {
    state.flights = state.flights.filter((flight) => !(flight.senderId === me.id && flight.day === today()));
    save();
    return { dailyRemaining: DAILY_LIMIT };
  }

  throw new DemoHttpError(404, `No demo route for ${method.toUpperCase()} ${path}`);
};

export const demoAdapter: AxiosAdapter = async (config) => {
  // A short pause so loading states are visible and nothing resolves in the
  // same tick as the click that caused it.
  await new Promise((resolve) => setTimeout(resolve, 180));
  const respond = (status: number, data: unknown): AxiosResponse => ({
    data,
    status,
    statusText: status < 400 ? 'OK' : 'Error',
    headers: {},
    config,
  });
  try {
    return respond(200, route(config));
  } catch (error) {
    if (error instanceof DemoHttpError) {
      throw new AxiosError(error.message, String(error.status), config, undefined, respond(error.status, error.data));
    }
    throw error;
  }
};
