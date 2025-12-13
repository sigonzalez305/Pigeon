import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversationStore } from '../store/conversationStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { subscribeToConversation } from '../services/websocket';

export const ConversationThread = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { messages, fetchMessages, sendMessage } = useConversationStore();
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationMessages = messages[Number(conversationId)] || [];

  useEffect(() => {
    if (conversationId) {
      fetchMessages(Number(conversationId));
      subscribeToConversation(Number(conversationId));
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <header className="p-4 border-b-2 border-ui-border flex items-center gap-3 bg-dark-800">
        <button
          onClick={() => navigate('/inbox')}
          className="p-2 hover:bg-ui-panel rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink" />
        <h2 className="font-semibold text-lg">Conversation</h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
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
      <div className="p-4 border-t-2 border-ui-border bg-dark-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Write a scroll..."
            className="flex-1 bg-ui-panel border-2 border-ui-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
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
            ? 'bg-neon-cyan text-dark-900'
            : 'bg-ui-panel border border-ui-border text-white'
        }`}
      >
        <p className="text-sm">{message.body}</p>
        <div className="flex items-center gap-2 mt-1 text-xs opacity-70">
          <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
          {isOwn && <StatusIndicator status={message.status} />}
        </div>
      </div>
    </motion.div>
  );
};

const StatusIndicator = ({ status }: { status: string }) => {
  const icons: Record<string, string> = {
    sending: '⏳',
    sent: '✓',
    delivered: '✓✓',
    read: '👁️',
  };

  return <span>{icons[status] || '?'}</span>;
};
