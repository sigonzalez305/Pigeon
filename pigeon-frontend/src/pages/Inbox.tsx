import { useEffect } from 'react';
import { useConversationStore } from '../store/conversationStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Inbox = () => {
  const { conversations, fetchConversations } = useConversationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 border-b-2 border-ui-border">
        <h1 className="text-2xl font-bold text-neon-cyan">Inbox</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📭</div>
              <p>No conversations yet</p>
              <p className="text-sm">Send your first message!</p>
            </div>
          </div>
        ) : (
          conversations.map((conversation, i) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ConversationItem
                conversation={conversation}
                onClick={() => navigate(`/conversation/${conversation.id}`)}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const ConversationItem = ({ conversation, onClick }: any) => {
  const lastMessage = conversation.lastMessage;
  const hasUnread = conversation.unreadCount > 0;
  const otherUserId = conversation.participantIds[1] || conversation.participantIds[0];

  return (
    <button
      onClick={onClick}
      className="w-full p-4 flex items-center gap-4 border-b border-ui-border hover:bg-ui-panel transition-colors"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center text-xl font-bold">
        {otherUserId?.toString()[0] || 'U'}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-white">User #{otherUserId}</h3>
          <span className="text-xs text-gray-400">
            {lastMessage && new Date(lastMessage.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <p className={`text-sm ${hasUnread ? 'text-white font-medium' : 'text-gray-400'}`}>
          {lastMessage?.body || 'No messages yet'}
        </p>
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <div className="w-6 h-6 rounded-full bg-neon-cyan text-dark-900 text-xs font-bold flex items-center justify-center">
          {conversation.unreadCount}
        </div>
      )}
    </button>
  );
};
