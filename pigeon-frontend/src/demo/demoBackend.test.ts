// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

// The demo backend persists to localStorage and schedules replies on window.
const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => void storage.set(key, value),
  removeItem: (key: string) => void storage.delete(key),
});
vi.stubGlobal('window', { setTimeout: () => 0 });

const { demoAdapter, resetDemoData } = await import('./demoBackend');

const call = async (method: string, url: string, data?: unknown, token = 'demo-1') => {
  const config = {
    method,
    url,
    data: data === undefined ? undefined : JSON.stringify(data),
    headers: { Authorization: `Bearer ${token}` },
  } as unknown as InternalAxiosRequestConfig;
  return (await demoAdapter(config)).data as any;
};

const failure = async (run: Promise<unknown>) => {
  try {
    await run;
  } catch (error: any) {
    return { status: error.response.status, data: error.response.data };
  }
  throw new Error('expected the request to fail');
};

describe('demo backend', () => {
  beforeEach(() => {
    storage.clear();
    resetDemoData();
    vi.useRealTimers();
  });

  it('signs in a seeded account and rejects a wrong password', async () => {
    const ok = await call('post', '/api/auth/login', { phone: '(202) 555-0111', password: 'password' });
    expect(ok.user.displayName).toBe('Alice');
    const bad = await failure(call('post', '/api/auth/login', { phone: '+12025550111', password: 'nope' }));
    expect(bad.status).toBe(401);
  });

  it('flies a Pigeon Message from send to landing', async () => {
    vi.useFakeTimers({ now: new Date('2026-03-01T12:00:00Z') });
    const sending = call('post', '/api/pigeon-messages', {
      recipientPhone: '(305) 555-0178',
      body: 'Meet me on the roof.',
      clientNonce: 'abc',
      pigeonName: 'Pico',
    });
    await vi.advanceTimersByTimeAsync(200);
    const flight = await sending;

    expect(flight.state).toBe('flying');
    expect(flight.origin.displayRegion).toContain('Washington');
    expect(flight.arrivalAt).toBeGreaterThan(flight.launchAt);
    expect(flight.dailyRemaining).toBe(0);

    // Arriving early changes nothing.
    const early = call('post', `/api/pigeon-messages/${flight.id}/arrive`);
    await vi.advanceTimersByTimeAsync(200);
    expect((await early).state).toBe('flying');

    vi.setSystemTime(flight.arrivalAt + 1);
    const landing = call('post', `/api/pigeon-messages/${flight.id}/arrive`);
    await vi.advanceTimersByTimeAsync(200);
    expect((await landing).state).toBe('delivered');

    const active = call('get', '/api/pigeon-messages/active');
    await vi.advanceTimersByTimeAsync(200);
    expect((await active).activeFlight).toBeNull();

    // The scroll is in the conversation with Bob.
    const thread = call('get', `/api/conversations/${flight.conversationId}/messages`);
    await vi.advanceTimersByTimeAsync(200);
    expect((await thread).some((m: any) => m.body === 'Meet me on the roof.')).toBe(true);
  });

  it('allows one Pigeon Message a day, and a retry of the same one', async () => {
    const first = await call('post', '/api/pigeon-messages', { recipientPhone: '3055550178', body: 'one', clientNonce: 'n1' });
    const retry = await call('post', '/api/pigeon-messages', { recipientPhone: '3055550178', body: 'one', clientNonce: 'n1' });
    expect(retry.id).toBe(first.id);

    const second = await failure(call('post', '/api/pigeon-messages', { recipientPhone: '4155550142', body: 'two', clientNonce: 'n2' }));
    expect(second.status).toBe(429);
    expect(second.data.code).toBe('daily_limit_reached');

    await call('post', '/api/pigeon-messages/reset-daily');
    const again = await call('post', '/api/pigeon-messages', { recipientPhone: '4155550142', body: 'two', clientNonce: 'n3' });
    expect(again.state).toBe('flying');
  });

  it('refuses a pigeon to yourself and to an unroutable number', async () => {
    const self = await failure(call('post', '/api/pigeon-messages', { recipientPhone: '2025550111', body: 'x', clientNonce: 'a' }));
    expect(self.data.code).toBe('self_send');
    const nowhere = await failure(call('post', '/api/pigeon-messages', { recipientPhone: '0005550111', body: 'x', clientNonce: 'b' }));
    expect(nowhere.data.code).toBe('unroutable');
  });

  it('only shows a person their own conversations', async () => {
    const alice = await call('get', '/api/conversations', undefined, 'demo-1');
    expect(alice.map((c: any) => c.title).sort()).toEqual(['Bob', 'Charlie']);
    const denied = await failure(call('get', '/api/conversations/12/messages', undefined, 'demo-1'));
    expect(denied.status).toBe(404);
  });
});
