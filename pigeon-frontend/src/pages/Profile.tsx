import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePigeonStore } from '../store/pigeonStore';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { PicoSprite } from '../components/pigeon/PicoSprite';
import { DEMO_MODE } from '../config';
import { resetDailyPigeon } from '../services/pigeonMessages';
import { resetDemoData } from '../demo/demoBackend';
import { useFlightStore } from '../store/flightStore';
import { useState } from 'react';

export const Profile = () => {
  const { user, logout } = useAuthStore();
  const { party, activePigeon, fetchParty } = usePigeonStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParty();
  }, []);

  const hydrateFlight = useFlightStore((state) => state.hydrate);
  const clearFlight = useFlightStore((state) => state.clearFlight);
  const [notice, setNotice] = useState('');

  const resetDaily = async () => {
    try {
      await resetDailyPigeon();
      clearFlight();
      await hydrateFlight();
      setNotice("Today's Pigeon Message is available again.");
    } catch {
      setNotice('The daily pigeon could not be reset here.');
    }
  };

  const wipeDemo = () => {
    resetDemoData();
    clearFlight();
    logout();
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--wheat)' }}>Profile</h1>
        <p className="text-[var(--text-secondary)]">Manage your account and pigeons</p>
      </header>

      {/* User Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold" style={{ background: 'var(--surface-raised)', color: 'var(--wheat)', border: '1px solid var(--border-subtle)' }}>
            {user?.displayName?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.displayName}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{user?.phone}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 hover:bg-red-500/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </motion.div>

      {/* Pigeon Party */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="panel"
      >
        <h3 className="text-lg font-bold mb-4">Your Pigeon Party</h3>

        {party.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-8">No pigeons yet</p>
        ) : (
          <div className="space-y-3">
            {party.map((pigeon) => (
              <div
                key={pigeon.id}
                className={`p-4 rounded-lg border-2 ${
                  activePigeon?.id === pigeon.id
                    ? 'border-[var(--petrol)] bg-[var(--surface-raised)]'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-soft)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PicoSprite animation="idle" size={64} fallbackLabel={pigeon.name} />
                  <div className="flex-1">
                    <h4 className="font-bold">{pigeon.name}</h4>
                    <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
                      <span>Lv. {pigeon.level}</span>
                      <span>Energy {pigeon.energy}</span>
                      <span>{pigeon.trait}</span>
                    </div>
                  </div>
                  {activePigeon?.id === pigeon.id && (
                    <span className="px-3 py-1 bg-[var(--petrol)] text-[var(--coop-char)] rounded-full text-xs font-bold">
                      Active
                    </span>
                  )}
                </div>

                {/* Mood indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm text-[var(--text-secondary)]">Mood:</span>
                  <span className="text-sm capitalize">{pigeon.mood}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {DEMO_MODE && (
        <div className="panel mt-6">
          <h3 className="text-lg font-bold mb-1">Demo controls</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            This is a prototype running entirely in your browser. Nothing here is sent to a server or to another device.
          </p>
          <div className="grid gap-3">
            <button onClick={resetDaily} className="min-h-[44px] rounded-lg border px-4 text-sm font-semibold" style={{ borderColor: 'var(--petrol)', color: 'var(--petrol)' }}>
              Reset today's Pigeon Message
            </button>
            <button onClick={wipeDemo} className="min-h-[44px] rounded-lg border px-4 text-sm font-semibold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}>
              Start the demo over
            </button>
            {notice && <p role="status" className="text-sm" style={{ color: 'var(--wheat)' }}>{notice}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
