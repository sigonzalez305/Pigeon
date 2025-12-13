import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { usePigeonStore } from '../store/pigeonStore';
import { useConversationStore } from '../store/conversationStore';
import { Mail, Send, Home as HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OverworldHome = () => {
  const navigate = useNavigate();
  const { party, activePigeon, fetchParty } = usePigeonStore();
  const { conversations } = useConversationStore();

  useEffect(() => {
    fetchParty();
  }, []);

  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="h-full flex flex-col scanlines">
      {/* HUD */}
      <div className="p-4 flex justify-between items-start">
        <div className="flex gap-2">
          <HUDChip label="Network" value="Online" className="text-green-400" />
          <HUDChip label="Level" value={activePigeon?.level || 1} />
        </div>
        <HUDChip label="Energy" value={activePigeon?.energy || 100} />
      </div>

      {/* Overworld Scene */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <motion.div
          className="relative w-full max-w-2xl aspect-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-purple-900/20 rounded-2xl" />

          {/* Interactables */}
          <div className="relative h-full flex items-center justify-around p-8">
            {/* Mailbox */}
            <Interactable
              icon={Mail}
              label="Mailbox"
              hasNotification={unreadCount > 0}
              onClick={() => navigate('/inbox')}
            />

            {/* Coop */}
            <Interactable
              emoji="🏠"
              label="Coop"
              onClick={() => navigate('/profile')}
            />

            {/* Launch Pad */}
            <Interactable
              icon={Send}
              label="Launch"
              onClick={() => navigate('/send')}
            />
          </div>
        </motion.div>
      </div>

      {/* Dialog Box */}
      <div className="p-4">
        <div className="dialog-box">
          <p>
            Welcome to Coop Town{activePigeon ? `, ${activePigeon.name} is ready to fly` : ''}!
            Send a scroll to get started.
          </p>
        </div>
      </div>

      {/* Prompt Bar */}
      <div className="p-4 pt-0">
        <button
          onClick={() => navigate('/send')}
          className="w-full bg-ui-panel border-2 border-neon-cyan rounded-xl p-4 text-left text-gray-400 hover:text-white hover:shadow-glow transition-all"
        >
          📜 Send a scroll...
        </button>
      </div>
    </div>
  );
};

const HUDChip = ({ label, value, className = '' }: any) => (
  <div className="bg-dark-800/90 border border-ui-border rounded-lg px-3 py-1 text-xs">
    <span className="text-gray-400">{label}:</span>{' '}
    <span className={`font-bold ${className}`}>{value}</span>
  </div>
);

const Interactable = ({ icon, emoji, label, hasNotification, onClick }: any) => {
  const Icon = icon;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 p-4"
    >
      {hasNotification && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-neon-pink rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
      <div className="bg-ui-panel border-2 border-neon-cyan rounded-2xl p-6 shadow-neon">
        {Icon ? (
          <Icon className="w-12 h-12 text-neon-cyan" />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
      </div>
      <span className="text-sm font-bold text-white">{label}</span>
    </motion.button>
  );
};
