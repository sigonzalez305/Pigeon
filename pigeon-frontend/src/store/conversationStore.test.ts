import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { useConversationStore, type Message } from './conversationStore';

vi.mock('axios');
const http = vi.mocked(axios, true);

const serverMessage = (over: Partial<Message> = {}): Message => ({
  id: 1,
  conversationId: 7,
  senderId: 2,
  body: 'earlier',
  createdAt: '2026-01-01T00:00:00Z',
  status: 'read',
  ...over,
});

describe('conversationStore', () => {
  beforeEach(() => {
    useConversationStore.setState({ conversations: [], messages: {} });
    vi.resetAllMocks();
  });

  it('keeps a message sent while the thread was still loading', async () => {
    // The thread fetch starts first and resolves last: the classic slow-network
    // order that used to wipe the just-sent message off the screen.
    let finishFetch!: (value: unknown) => void;
    http.get.mockReturnValueOnce(new Promise((resolve) => { finishFetch = resolve; }) as never);
    http.post.mockResolvedValueOnce({ data: serverMessage({ id: 2, senderId: 1, body: 'hello', clientNonce: 'n1', status: 'sent' }) });

    const store = useConversationStore.getState();
    const fetching = store.fetchMessages(7);
    const sending = store.sendMessage(7, 'hello', 'n1');
    finishFetch({ data: [serverMessage()] });
    await Promise.all([fetching, sending]);

    const bodies = useConversationStore.getState().messages[7].map((m) => m.body);
    expect(bodies).toEqual(['earlier', 'hello']);
  });

  it('does not double a message that arrives by both response and socket', async () => {
    http.post.mockResolvedValueOnce({ data: serverMessage({ id: 2, senderId: 1, body: 'hello', clientNonce: 'n1', status: 'sent' }) });
    const store = useConversationStore.getState();
    await store.sendMessage(7, 'hello', 'n1');
    store.addMessage(serverMessage({ id: 2, senderId: 1, body: 'hello', clientNonce: 'n1', status: 'sent' }));
    expect(useConversationStore.getState().messages[7]).toHaveLength(1);
  });

  it('removes the optimistic message when the send fails', async () => {
    http.post.mockRejectedValueOnce(new Error('offline'));
    await expect(useConversationStore.getState().sendMessage(7, 'hello', 'n1')).rejects.toThrow();
    expect(useConversationStore.getState().messages[7]).toEqual([]);
  });
});
