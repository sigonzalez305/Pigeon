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

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  messages: {},

  fetchConversations: async () => {
    const response = await axios.get('/api/conversations');
    set({ conversations: response.data });
  },

  fetchMessages: async (conversationId) => {
    const response = await axios.get(`/api/conversations/${conversationId}/messages`);
    set(state => ({
      messages: { ...state.messages, [conversationId]: response.data }
    }));
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

      // Replace optimistic message with server message
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map(m =>
            m.clientNonce === clientNonce ? response.data : m
          )
        }
      }));
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
    set(state => ({
      messages: {
        ...state.messages,
        [message.conversationId]: [
          ...(state.messages[message.conversationId] || []),
          message
        ]
      }
    }));
  },
}));
