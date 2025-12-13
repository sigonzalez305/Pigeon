import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import { useConversationStore } from '../store/conversationStore';

let stompClient: Client | null = null;
let subscriptions: Map<string, StompSubscription> = new Map();

export const connectWebSocket = (token: string) => {
  if (stompClient?.active) {
    console.log('WebSocket already connected');
    return stompClient;
  }

  const socket = new SockJS('http://localhost:8080/ws');

  stompClient = new Client({
    webSocketFactory: () => socket as any,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => {
      console.log('STOMP: ' + str);
    },
    onConnect: () => {
      console.log('WebSocket connected');
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
    },
  });

  stompClient.activate();
  return stompClient;
};

export const subscribeToConversation = (conversationId: number) => {
  if (!stompClient?.active) {
    console.error('WebSocket not connected');
    return;
  }

  const destination = `/topic/conversations/${conversationId}`;

  if (subscriptions.has(destination)) {
    console.log('Already subscribed to', destination);
    return;
  }

  const subscription = stompClient.subscribe(destination, (message) => {
    const newMessage = JSON.parse(message.body);
    console.log('Received message:', newMessage);
    useConversationStore.getState().addMessage(newMessage);
  });

  subscriptions.set(destination, subscription);
};

export const unsubscribeFromConversation = (conversationId: number) => {
  const destination = `/topic/conversations/${conversationId}`;
  const subscription = subscriptions.get(destination);

  if (subscription) {
    subscription.unsubscribe();
    subscriptions.delete(destination);
  }
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    subscriptions.forEach(sub => sub.unsubscribe());
    subscriptions.clear();
    stompClient.deactivate();
    stompClient = null;
  }
};
