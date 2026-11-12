import { create } from 'zustand';
import axios from 'axios';

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  clientNonce?: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: number;
  participantIds: number[];
  /** The other person's name, when the server provides it. */
  title?: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface ConversationState {
  conversations: Conversation[];
  messages: Record<number, Message[]>;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, body: string, clientNonce: string) => Promise<void>;
  updateMessageStatus: (messageId: number, status: string) => void;
  addMessage: (message: Message) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  messages: {},

  fetchConversations: async () => {
    const response = await axios.get('/api/conversations');
    set({ conversations: response.data });
  },

  fetchMessages: async (conversationId) => {
    const response = await axios.get(`/api/conversations/${conversationId}/messages`);
    const fromServer: Message[] = response.data;
    set(state => {
      // A message sent while this fetch was in flight is not in the response,
      // whether or not its own request has finished. Replacing the list
      // outright dropped it from the screen, so the user watched their message
      // vanish. Anything sent from this device that the response does not yet
      // know about is kept.
      const stillSending = (state.messages[conversationId] || []).filter(
        local =>
          Boolean(local.clientNonce) &&
          !fromServer.some(m => m.id === local.id || (m.clientNonce && m.clientNonce === local.clientNonce))
      );
      return { messages: { ...state.messages, [conversationId]: [...fromServer, ...stillSending] } };
    });
  },

  sendMessage: async (conversationId, body, clientNonce) => {
    const optimisticMessage: Message = {
      id: Date.now(),
      conversationId,
      senderId: 1, // Will be set by server
      body,
      clientNonce,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    // Optimistic update
    set(state => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), optimisticMessage]
      }
    }));

    try {
      const response = await axios.post(`/api/conversations/${conversationId}/messages`, {
        body,
        clientNonce,
      });

      // Replace the optimistic message with the server's. If a refetch already
      // delivered the server copy, drop the optimistic one instead of doubling it.
      set(state => {
        const current = state.messages[conversationId] || [];
        const alreadyThere = current.some(m => m.id === response.data.id);
        const next = alreadyThere
          ? current.filter(m => !(m.clientNonce === clientNonce && m.status === 'sending'))
          : current.some(m => m.clientNonce === clientNonce)
            ? current.map(m => (m.clientNonce === clientNonce ? response.data : m))
            : [...current, response.data];
        return { messages: { ...state.messages, [conversationId]: next } };
      });
    } catch (error) {
      // Remove failed message
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].filter(m =>
            m.clientNonce !== clientNonce
          )
        }
      }));
      throw error;
    }
  },

  updateMessageStatus: (messageId, status) => {
    set(state => {
      const newMessages = { ...state.messages };
      Object.keys(newMessages).forEach(convId => {
        newMessages[Number(convId)] = newMessages[Number(convId)].map(m =>
          m.id === messageId ? { ...m, status: status as Message['status'] } : m
        );
      });
      return { messages: newMessages };
    });
  },

  addMessage: (message) => {
    set(state => {
      const current = state.messages[message.conversationId] || [];
      // The sender also receives their own message over the socket.
      if (current.some(m => m.id === message.id)) return state;
      return { messages: { ...state.messages, [message.conversationId]: [...current, message] } };
    });
  },
}));
