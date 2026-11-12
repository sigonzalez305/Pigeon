import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../store/conversationStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { BackIcon, ReceiptIcon, SendIcon, type ReceiptStatus } from '../components/icons/DuskIcons';
import { subscribeToConversation } from '../services/websocket';

export const ConversationThread = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { messages, conversations, fetchMessages, fetchConversations, sendMessage } = useConversationStore();
  const title = conversations.find((c) => c.id === Number(conversationId))?.title || 'Conversation';
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationMessages = messages[Number(conversationId)] || [];

  useEffect(() => {
    if (conversationId) {
      fetchMessages(Number(conversationId));
      if (conversations.length === 0) fetchConversations();
      subscribeToConversation(Number(conversationId));
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [conversationMessages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId) return;

    const clientNonce = `${Date.now()}-${Math.random()}`;
    try {
      await sendMessage(Number(conversationId), inputValue, clientNonce);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="p-4 border-b-2 border-[var(--border-subtle)] flex items-center gap-3 bg-[var(--surface-soft)]">
        <button
          onClick={() => navigate('/inbox')}
          aria-label="Back to messages"
          className="flex h-11 w-11 items-center justify-center hover:bg-[var(--surface-raised)] rounded-lg transition-colors"
          style={{ color: 'var(--wheat)' }}
        >
          <BackIcon />
        </button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: 'var(--surface-raised)', color: 'var(--wheat)', border: '1px solid var(--border-subtle)' }}>{title[0]}</div>
        <h2 className="font-semibold text-lg">{title}</h2>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)]">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {conversationMessages.map((message) => (
              <MessageBubble key={message.id} message={message} isOwn={message.senderId === user?.id} />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="p-4 border-t-2 border-[var(--border-subtle)] bg-[var(--surface-soft)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a message…"
            aria-label="Message"
            className="min-w-0 flex-1 bg-[var(--surface-raised)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-[var(--petrol)] focus:outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="btn-primary flex shrink-0 items-center gap-2 px-4"
          >
            <SendIcon size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isOwn
            ? 'bg-[var(--petrol)] text-[var(--coop-char)]'
            : 'bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
        }`}
      >
        <p className="text-sm">{message.body}</p>
        <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
          {isOwn && <StatusIndicator status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  const known: ReceiptStatus = (['sending', 'sent', 'delivered', 'read'] as const).includes(status as ReceiptStatus)
    ? (status as ReceiptStatus)
    : 'sent';
  return <ReceiptIcon status={known} />;
};
