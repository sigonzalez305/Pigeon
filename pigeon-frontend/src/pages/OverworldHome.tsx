import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mail, Send, Home, Heart, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePigeonStore } from '../store/pigeonStore';
import { useConversationStore } from '../store/conversationStore';
import { PicoSprite } from '../components/pigeon/PicoSprite';
import { FlightRibbon } from '../components/flight/FlightRibbon';
import { flightProgress, flightStatus, useFlightStore } from '../store/flightStore';

export const OverworldHome = () => {
  const navigate = useNavigate();
  const { activePigeon, fetchParty } = usePigeonStore();
  const { conversations } = useConversationStore();
  const [picoAction, setPicoAction] = useState<'idle' | 'pet-happy' | 'eat'>('idle');
  const activeFlight = useFlightStore((state) => state.activeFlight);
  const hydrate = useFlightStore((state) => state.hydrate);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  // Coop Town is the app's home, so it is where an in-flight pigeon should be
  // visible. Without this the flight view was only reachable from the tail of
  // the launch ceremony and became unreachable the moment you navigated away.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!activeFlight) return;
    if (now >= activeFlight.arrivalAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeFlight, now]);

  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const pigeonName = activePigeon?.name || 'Pico';

  const playAction = (action: 'pet-happy' | 'eat') => {
    setPicoAction(action);
  };

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'var(--slate-dusk)' }}>
      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--petrol)' }}>Coop Town</p>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--wheat)' }}>{pigeonName}'s Coop</h1>
        </div>
        <div className="flex gap-2">
          <HUDChip label="Lv" value={activePigeon?.level || 1} />
          <HUDChip label="Energy" value={`${activePigeon?.energy || 100}%`} />
        </div>
      </div>

      <main className="flex-1 px-4 pb-4 flex flex-col gap-4">
        {activeFlight && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/flight')}
            className="w-full rounded-2xl border p-4 text-left"
            style={{ background: 'var(--coop-char)', borderColor: 'var(--petrol)' }}
          >
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--petrol)' }}>
                {flightStatus(activeFlight) === 'arrived' ? 'Pigeon has landed' : 'Pigeon in flight'}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {activeFlight.origin.displayRegion} → {activeFlight.destination.displayRegion}
              </span>
            </div>
            <FlightRibbon progress={flightProgress(activeFlight, now)} status={flightStatus(activeFlight, now)} />
          </motion.button>
        )}

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-[360px] overflow-hidden rounded-[28px] border"
          style={{
            background: 'linear-gradient(180deg, #20283a 0%, #1b2030 50%, #141821 100%)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-2/3 opacity-70" style={{ background: 'radial-gradient(circle at 72% 18%, rgba(224,80,154,.28), transparent 28%), radial-gradient(circle at 24% 22%, rgba(47,191,163,.18), transparent 32%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-28 border-t" style={{ background: '#11151d', borderColor: 'rgba(232,217,181,.12)' }} />

          <div className="relative z-10 h-full min-h-[360px] flex flex-col items-center justify-end pb-20">
            <button
              type="button"
              className="relative rounded-full p-3 transition-transform active:scale-95"
              onClick={() => playAction('pet-happy')}
              aria-label={`Pet ${pigeonName}`}
            >
              <PicoSprite
                animation={picoAction}
                size={180}
                fallbackLabel={pigeonName}
                onComplete={() => setPicoAction('idle')}
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs" style={{ background: 'rgba(18,21,29,.92)', color: 'var(--wheat)' }}>
                Tap {pigeonName} to pet
              </span>
            </button>
          </div>

          <div className="absolute left-4 bottom-4 z-20 flex gap-2">
            <ActionButton icon={Heart} label="Pet" onClick={() => playAction('pet-happy')} />
            <ActionButton icon={Cookie} label="Snack" onClick={() => playAction('eat')} />
          </div>
        </motion.section>

        <section className="grid grid-cols-3 gap-3">
          <WorldAction icon={Mail} label="Mailbox" badge={unreadCount} onClick={() => navigate('/inbox')} />
          <WorldAction icon={Home} label="Coop" onClick={() => navigate('/profile')} />
          <WorldAction icon={Send} label="Launch" primary onClick={() => navigate('/send')} />
        </section>

        <div className="rounded-2xl border p-4" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {pigeonName} is ready. Ordinary messages are instant; a Pigeon Message becomes a journey.
          </p>
        </div>

        <button
          onClick={() => navigate('/send')}
          className="w-full rounded-2xl px-5 py-4 font-semibold transition-transform active:scale-[0.99]"
          style={{ background: 'var(--petrol)', color: 'var(--coop-char)' }}
        >
          Send today's Pigeon Message
        </button>
      </main>
    </div>
  );
};

const HUDChip = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border px-3 py-2 text-xs" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
    <span style={{ color: 'var(--text-secondary)' }}>{label} </span>
    <strong style={{ color: 'var(--wheat)' }}>{value}</strong>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs"
    style={{ background: 'rgba(18,21,29,.9)', borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

const WorldAction = ({ icon: Icon, label, badge = 0, primary = false, onClick }: { icon: any; label: string; badge?: number; primary?: boolean; onClick: () => void }) => (
  <motion.button
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border"
    style={{
      background: primary ? 'rgba(47,191,163,.12)' : 'var(--coop-char)',
      borderColor: primary ? 'var(--petrol)' : 'var(--border-subtle)',
      color: primary ? 'var(--petrol)' : 'var(--wheat)',
    }}
  >
    {badge > 0 && (
      <span className="absolute right-2 top-2 min-w-5 rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'var(--feather-magenta)', color: 'white' }}>{badge}</span>
    )}
    <Icon className="h-6 w-6" />
    <span className="text-xs font-medium">{label}</span>
  </motion.button>
);
