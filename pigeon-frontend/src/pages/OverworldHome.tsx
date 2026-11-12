import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Heart, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePigeonStore } from '../store/pigeonStore';
import { useConversationStore } from '../store/conversationStore';
import { PicoSprite } from '../components/pigeon/PicoSprite';
import { CoopTownScene } from '../components/coop/CoopTownScene';
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

        <CoopTownScene
          hotspots={[
            { id: 'coop', label: 'Loft', left: 1, top: 6, width: 20, height: 70, onSelect: () => navigate('/profile') },
            { id: 'launch', label: 'Launch pad', left: 61, top: 60, width: 9, height: 36, onSelect: () => navigate('/send') },
            { id: 'mailbox', label: 'Mailbox', left: 75, top: 28, width: 9, height: 60, badge: unreadCount, onSelect: () => navigate('/inbox') },
          ]}
        >
          <button
            type="button"
            className="block rounded-full transition-transform active:scale-95"
            onClick={() => playAction('pet-happy')}
            aria-label={`Pet ${pigeonName}`}
          >
            <PicoSprite
              animation={picoAction}
              size={150}
              fallbackLabel={pigeonName}
              onComplete={() => setPicoAction('idle')}
            />
          </button>
        </CoopTownScene>

        <div className="flex items-center gap-2">
          <ActionButton icon={Heart} label="Pet" onClick={() => playAction('pet-happy')} />
          <ActionButton icon={Cookie} label="Snack" onClick={() => playAction('eat')} />
          <p className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>Drag the rooftop to look around</p>
        </div>

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
    className="flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm"
    style={{ background: 'rgba(18,21,29,.9)', borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);
