import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, CloudSun, Feather, MapPin, Phone, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePigeonStore } from '../store/pigeonStore';
import { PicoSprite } from '../components/pigeon/PicoSprite';
import type { PicoAnimation } from '../assets/picoRuntime';

const STEPS = ['Recipient', 'Pigeon', 'Scroll', 'Skies', 'Launch'] as const;

type CeremonyPhase = 'ready' | 'carry-scroll' | 'takeoff' | 'flap' | 'glide';

export const SendFlow = () => {
  const navigate = useNavigate();
  const { party, activePigeon, fetchParty } = usePigeonStore();
  const [step, setStep] = useState(0);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [selectedPigeon, setSelectedPigeon] = useState<number | null>(null);
  const [phase, setPhase] = useState<CeremonyPhase>('ready');
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    fetchParty();
  }, [fetchParty]);

  useEffect(() => {
    if (!selectedPigeon && activePigeon) setSelectedPigeon(activePigeon.id);
  }, [activePigeon, selectedPigeon]);

  const selected = useMemo(
    () => party.find((pigeon) => pigeon.id === selectedPigeon) || activePigeon || party[0],
    [activePigeon, party, selectedPigeon],
  );

  const phoneValid = recipientPhone.replace(/\D/g, '').length >= 10;
  const messageValid = messageBody.trim().length > 0;

  const canContinue =
    (step === 0 && phoneValid) ||
    (step === 1 && Boolean(selected)) ||
    (step === 2 && messageValid) ||
    step === 3;

  const back = () => {
    if (launched) return;
    if (step === 0) navigate('/home');
    else setStep((value) => value - 1);
  };

  const next = () => {
    if (step < 4 && canContinue) setStep((value) => value + 1);
  };

  const launch = () => {
    setLaunched(true);
    setPhase('carry-scroll');
  };

  const handleCeremonyComplete = () => {
    if (phase === 'carry-scroll') setPhase('takeoff');
    else if (phase === 'takeoff') setPhase('flap');
  };

  useEffect(() => {
    if (phase !== 'flap') return;
    const timer = window.setTimeout(() => setPhase('glide'), 1400);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'var(--slate-dusk)' }}>
      <header className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <button onClick={back} className="rounded-full p-2" aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--petrol)' }}>Pigeon Message</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--wheat)' }}>{launched ? 'Pico is on the way' : 'Prepare the journey'}</h1>
        </div>
      </header>

      {!launched && <StepRail current={step} />}

      <main className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {!launched && step === 0 && (
            <Screen key="recipient" title="Who is this for?" subtitle="Enter a U.S. phone number. We’ll use the area code for the first routing pass.">
              <div className="rounded-2xl border p-4" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
                <label className="mb-2 block text-xs" style={{ color: 'var(--text-secondary)' }}>Recipient phone number</label>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ borderColor: phoneValid ? 'var(--petrol)' : 'var(--border-subtle)', background: 'var(--surface-soft)' }}>
                  <Phone className="h-5 w-5" style={{ color: 'var(--petrol)' }} />
                  <input
                    value={recipientPhone}
                    onChange={(event) => setRecipientPhone(event.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(305) 555-0178"
                    className="w-full bg-transparent text-base outline-none"
                    style={{ color: 'var(--text-primary)' }}
                    autoFocus
                  />
                  {phoneValid && <Check className="h-5 w-5" style={{ color: 'var(--petrol)' }} />}
                </div>
              </div>
            </Screen>
          )}

          {!launched && step === 1 && (
            <Screen key="pigeon" title="Choose your pigeon" subtitle="Your active pigeon is preselected. Cosmetics never affect message reliability.">
              <div className="grid grid-cols-2 gap-3">
                {party.length === 0 ? (
                  <div className="col-span-2 flex flex-col items-center gap-4 rounded-3xl border p-8" style={{ borderColor: 'var(--border-subtle)', background: 'var(--coop-char)' }}>
                    <PicoSprite animation="idle" size={150} fallbackLabel="Pico" />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading your loft…</p>
                  </div>
                ) : party.map((pigeon) => {
                  const isSelected = selected?.id === pigeon.id;
                  return (
                    <motion.button
                      key={pigeon.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedPigeon(pigeon.id)}
                      className="rounded-3xl border p-4 text-left"
                      style={{
                        background: isSelected ? 'rgba(47,191,163,.10)' : 'var(--coop-char)',
                        borderColor: isSelected ? 'var(--petrol)' : 'var(--border-subtle)',
                      }}
                    >
                      <PicoSprite animation="idle" size={110} fallbackLabel={pigeon.name} className="mx-auto" />
                      <p className="mt-2 font-semibold" style={{ color: 'var(--wheat)' }}>{pigeon.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Level {pigeon.level} · {pigeon.trait}</p>
                    </motion.button>
                  );
                })}
              </div>
            </Screen>
          )}

          {!launched && step === 2 && (
            <Screen key="scroll" title="Write the scroll" subtitle="You get one special flight a day. Make it worth sending.">
              <div className="rounded-[26px] p-5 shadow-xl" style={{ background: 'var(--wheat)', color: 'var(--coop-char)' }}>
                <div className="mb-3 flex items-center gap-2 text-xs opacity-70">
                  <Feather className="h-4 w-4" />
                  Scroll for {recipientPhone}
                </div>
                <textarea
                  value={messageBody}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder="There’s something I’ve been meaning to tell you…"
                  rows={9}
                  maxLength={300}
                  className="w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-black/35"
                  autoFocus
                />
                <div className="mt-3 text-right text-xs opacity-60">{messageBody.length}/300</div>
              </div>
            </Screen>
          )}

          {!launched && step === 3 && (
            <Screen key="skies" title="Check the skies" subtitle="This visual is wired for the real weather service in the next slice. Weather changes the journey, never message reliability.">
              <div className="space-y-3">
                <InfoCard icon={MapPin} title="Route" value="Area-code routing" detail="Approximate origin → destination" />
                <InfoCard icon={CloudSun} title="Weather" value="Pending live lookup" detail="Neutral conditions if the service is unavailable" />
                <InfoCard icon={Send} title="Test ETA" value="1–5 minutes" detail="The message layer remains immediate" />
              </div>
            </Screen>
          )}

          {!launched && step === 4 && (
            <Screen key="review" title="Ready to fly" subtitle="Review the ritual, attach the scroll, then launch.">
              <div className="rounded-3xl border p-5" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-4">
                  <PicoSprite animation="carry-scroll" size={128} fallbackLabel={selected?.name || 'Pico'} />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--wheat)' }}>{selected?.name || 'Pico'}</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{recipientPhone}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl p-4 text-sm" style={{ background: 'var(--wheat)', color: 'var(--coop-char)' }}>
                  “{messageBody}”
                </div>
              </div>
            </Screen>
          )}

          {launched && (
            <LaunchCeremony
              key="ceremony"
              phase={phase}
              pigeonName={selected?.name || 'Pico'}
              onActionComplete={handleCeremonyComplete}
              onOpenFlight={() => navigate('/home')}
            />
          )}
        </AnimatePresence>
      </main>

      {!launched && (
        <footer className="p-4 pt-0">
          {step < 4 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={next}
              className="w-full rounded-2xl px-5 py-4 font-semibold disabled:opacity-40"
              style={{ background: 'var(--petrol)', color: 'var(--coop-char)' }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={launch}
              className="w-full rounded-2xl px-5 py-4 font-semibold"
              style={{ background: 'var(--petrol)', color: 'var(--coop-char)' }}
            >
              Attach Scroll & Launch
            </button>
          )}
        </footer>
      )}
    </div>
  );
};

const Screen = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, x: 18 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -18 }}
  >
    <h2 className="text-2xl font-semibold" style={{ color: 'var(--wheat)' }}>{title}</h2>
    <p className="mt-1 mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
    {children}
  </motion.section>
);

const StepRail = ({ current }: { current: number }) => (
  <div className="px-4 pt-4">
    <div className="flex items-center gap-1">
      {STEPS.map((label, index) => (
        <div key={label} className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="h-1 rounded-full" style={{ background: index <= current ? 'var(--petrol)' : 'var(--surface-raised)' }} />
          <span className="truncate text-[9px] uppercase tracking-wide" style={{ color: index === current ? 'var(--wheat)' : 'var(--text-secondary)' }}>{label}</span>
        </div>
      ))}
    </div>
  </div>
);

const InfoCard = ({ icon: Icon, title, value, detail }: { icon: any; title: string; value: string; detail: string }) => (
  <div className="flex gap-4 rounded-2xl border p-4" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
    <div className="rounded-xl p-3" style={{ background: 'rgba(47,191,163,.10)', color: 'var(--petrol)' }}><Icon className="h-5 w-5" /></div>
    <div>
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{title}</p>
      <p className="font-semibold" style={{ color: 'var(--wheat)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
    </div>
  </div>
);

const LaunchCeremony = ({ phase, pigeonName, onActionComplete, onOpenFlight }: { phase: CeremonyPhase; pigeonName: string; onActionComplete: () => void; onOpenFlight: () => void }) => {
  const animation: PicoAnimation = phase === 'ready' ? 'idle' : phase;
  const copy = {
    ready: 'Ready for takeoff.',
    'carry-scroll': 'Scroll secured. Checking it twice…',
    takeoff: 'Wings open. Leaving Coop Town…',
    flap: 'Across the skies!',
    glide: 'The journey has begun.',
  }[phase];

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[520px] flex-col items-center justify-center text-center">
      <div className="relative flex h-72 w-full max-w-md items-center justify-center overflow-hidden rounded-[32px] border" style={{ background: 'radial-gradient(circle at 50% 80%, rgba(47,191,163,.20), transparent 28%), linear-gradient(180deg,#242a42,#151924)', borderColor: 'var(--border-subtle)' }}>
        <motion.div
          animate={phase === 'flap' || phase === 'glide' ? { x: [-20, 28, -8], y: [8, -22, -8] } : { y: [0, -3, 0] }}
          transition={{ duration: phase === 'flap' || phase === 'glide' ? 2.2 : 1.8, repeat: phase === 'flap' || phase === 'glide' ? Infinity : 0 }}
        >
          <PicoSprite animation={animation} size={210} fallbackLabel={pigeonName} onComplete={onActionComplete} />
        </motion.div>
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.24em]" style={{ color: 'var(--petrol)' }}>{phase.replace('-', ' ')}</p>
      <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--wheat)' }}>{pigeonName} is flying</h2>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{copy}</p>
      {phase === 'glide' && (
        <button onClick={onOpenFlight} className="mt-8 rounded-2xl px-6 py-3 font-semibold" style={{ background: 'var(--petrol)', color: 'var(--coop-char)' }}>
          Open Flight View
        </button>
      )}
    </motion.section>
  );
};
