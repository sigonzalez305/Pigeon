import { useEffect, useState } from 'react';
import { CloudSun, MapPin, Navigation } from 'lucide-react';
import { BackIcon, WindIcon } from '../components/icons/DuskIcons';
import type { ActiveFlight } from '../store/flightStore';
import sky from '../assets/asset-bank/production/coop-town/sky.png';
import city from '../assets/asset-bank/production/coop-town/city.png';
import { useNavigate } from 'react-router-dom';
import { PicoSprite } from '../components/pigeon/PicoSprite';
import { FlightRibbon } from '../components/flight/FlightRibbon';
import { flightProgress, flightStatus, useFlightStore } from '../store/flightStore';

const project = (latitude: number, longitude: number) => {
  const minLon = -125;
  const maxLon = -66;
  const minLat = 24;
  const maxLat = 50;
  const x = ((longitude - minLon) / (maxLon - minLon)) * 100;
  const y = (1 - (latitude - minLat) / (maxLat - minLat)) * 100;
  return { x: Math.max(8, Math.min(92, x)), y: Math.max(18, Math.min(86, y)) };
};

const formatRemaining = (ms: number) => {
  if (ms <= 0) return 'Arrived';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export const FlightView = () => {
  const navigate = useNavigate();
  const activeFlight = useFlightStore((state) => state.activeFlight);
  const originWeather = useFlightStore((state) => state.originWeather);
  const destinationWeather = useFlightStore((state) => state.destinationWeather);
  const hydrated = useFlightStore((state) => state.hydrated);
  const hydrate = useFlightStore((state) => state.hydrate);
  const landFlight = useFlightStore((state) => state.landFlight);
  const [now, setNow] = useState(Date.now());
  const [landed, setLanded] = useState(false);
  // Landing clears the flight from the store, which used to swap this whole
  // view for "no pigeon in flight" at the exact moment Pico arrived. The view
  // keeps its own copy so the arrival can actually be seen.
  const [shown, setShown] = useState<ActiveFlight | null>(activeFlight);
  const [arrival, setArrival] = useState<'land' | 'deliver' | 'done'>('land');

  useEffect(() => {
    if (activeFlight) setShown(activeFlight);
  }, [activeFlight]);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  useEffect(() => {
    if (!activeFlight) return;
    // Stop ticking once the pigeon is down. The interval used to run forever,
    // re-rendering the whole view every second on a flight that had already
    // arrived.
    if (now >= activeFlight.arrivalAt) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeFlight, now]);

  useEffect(() => {
    if (!activeFlight || landed) return;
    if (now < activeFlight.arrivalAt) return;

    // Arrival is a real boundary, not just a progress bar reaching the end:
    // tell the server the flight is down so it stops being the active flight.
    setLanded(true);
    landFlight();
  }, [activeFlight, landFlight, landed, now]);

  if (!shown) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center" style={{ background: 'var(--slate-dusk)' }}>
        <PicoSprite animation="idle" size={160} fallbackLabel="Pico" />
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--wheat)' }}>No pigeon is currently in flight.</h1>
        <button onClick={() => navigate('/send')} className="rounded-2xl px-6 py-3 font-semibold" style={{ background: 'var(--petrol)', color: 'var(--coop-char)' }}>
          Send a Pigeon
        </button>
      </div>
    );
  }

  const progress = flightProgress(shown, now);
  const status = flightStatus(shown, now);
  const origin = project(shown.origin.latitude, shown.origin.longitude);
  const destination = project(shown.destination.latitude, shown.destination.longitude);
  const pigeon = {
    x: origin.x + (destination.x - origin.x) * progress,
    y: origin.y + (destination.y - origin.y) * progress - Math.sin(progress * Math.PI) * 16,
  };
  const milesRemaining = Math.max(0, Math.round(shown.distanceMiles * (1 - progress)));
  const remaining = shown.arrivalAt - now;

  return (
    <div className="min-h-full p-4" style={{ background: 'var(--slate-dusk)' }}>
      <header className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="flex h-11 w-11 items-center justify-center rounded-full" style={{ color: 'var(--wheat)' }} aria-label="Back to Coop Town"><BackIcon /></button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--petrol)' }}>Live Flight</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--wheat)' }}>{shown.pigeonName} {status === 'arrived' ? 'has landed' : 'is in the air'}</h1>
        </div>
      </header>

      <section className="overflow-hidden rounded-[30px] border" style={{ background: 'linear-gradient(180deg,#283149 0%,#151924 72%)', borderColor: 'var(--border-subtle)' }}>
        <div className="relative h-[330px] w-full overflow-hidden">
          <img src={sky} alt="" className="absolute inset-x-0 top-0 h-[78%] w-full object-cover opacity-80" />
          <img src={city} alt="" className="absolute inset-x-0 bottom-0 h-[30%] w-full object-cover object-bottom" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 45%)', maskImage: 'linear-gradient(to bottom, transparent, black 45%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(18,21,29,.25), rgba(18,21,29,.55))' }} />

          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M7 33 L16 19 L31 14 L42 17 L50 22 L59 18 L72 24 L82 31 L91 47 L89 62 L78 72 L67 77 L57 72 L47 82 L34 77 L28 67 L18 61 L11 50 Z" fill="rgba(18,21,29,.42)" stroke="rgba(232,217,181,.28)" strokeWidth=".7" />
            <path d={`M ${origin.x} ${origin.y} Q ${(origin.x + destination.x) / 2} ${Math.min(origin.y, destination.y) - 22} ${destination.x} ${destination.y}`} fill="none" stroke={status === 'arrived' ? 'rgba(224,80,154,.7)' : 'rgba(47,191,163,.6)'} strokeDasharray="2.2 2.2" strokeWidth="1.1" />
          </svg>

          <MapMarker x={origin.x} y={origin.y} label={shown.origin.displayRegion} tone="origin" />
          <MapMarker x={destination.x} y={destination.y} label={shown.destination.displayRegion} tone="destination" />

          <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pigeon.x}%`, top: `${pigeon.y}%` }}>
            <PicoSprite
              animation={status === 'arrived' ? (arrival === 'land' ? 'land' : arrival === 'deliver' ? 'deliver' : 'idle') : progress > 0.72 ? 'glide' : 'flap'}
              size={104}
              flip={destination.x > origin.x}
              fallbackLabel={shown.pigeonName}
              onComplete={() => setArrival((step) => (step === 'land' ? 'deliver' : 'done'))}
            />
          </div>

          <div className="absolute left-3 right-3 top-3 flex justify-between gap-2">
            <RouteChip icon={MapPin} label={shown.origin.source === 'PRECISE' ? 'Precision origin' : 'Area-code origin'} />
            <RouteChip icon={Navigation} label={`${Math.round(shown.distanceMiles)} mi`} />
          </div>
        </div>

        <div className="border-t p-4" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(18,21,29,.88)' }}>
          <FlightRibbon progress={progress} status={status} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="Remaining" value={`${milesRemaining} mi`} />
            <Stat label="ETA" value={formatRemaining(remaining)} />
            <Stat label="Progress" value={`${Math.round(progress * 100)}%`} />
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <WeatherCard title={shown.origin.displayRegion} weather={originWeather} />
        <WeatherCard title={shown.destination.displayRegion} weather={destinationWeather} />
      </section>

      <section className="mt-4 rounded-2xl border p-4" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-secondary)' }}>Scroll</p>
        <p className="mt-2 leading-relaxed" style={{ color: 'var(--wheat)' }}>
          {shown.messageBody ? `“${shown.messageBody}”` : 'The scroll is sealed for the journey.'}
        </p>
      </section>

      {status === 'arrived' && (
        <section role="status" className="mt-4 rounded-2xl border p-4" style={{ background: 'var(--coop-char)', borderColor: 'var(--feather-magenta)' }}>
          <p className="font-semibold" style={{ color: 'var(--wheat)' }}>Scroll delivered to {shown.destination.displayRegion}.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {shown.conversationId != null && (
              <button onClick={() => navigate(`/conversation/${shown.conversationId}`)} className="min-h-[44px] rounded-xl px-4 text-sm font-semibold" style={{ background: 'var(--feather-magenta)', color: '#fff' }}>
                Open conversation
              </button>
            )}
            <button onClick={() => navigate('/home')} className="min-h-[44px] rounded-xl border px-4 text-sm font-semibold" style={{ borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}>
              Back to Coop Town
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

const MapMarker = ({ x, y, label, tone }: { x: number; y: number; label: string; tone: 'origin' | 'destination' }) => {
  // Labels near an edge are anchored to that edge so they stay on the map.
  const anchor = x > 72 ? 'right-0 text-right' : x < 28 ? 'left-0 text-left' : 'left-1/2 -translate-x-1/2 text-center';
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="h-4 w-4 rounded-full border-2 shadow-lg" style={{ borderColor: tone === 'origin' ? 'var(--petrol)' : 'var(--feather-magenta)', background: 'var(--slate-dusk)' }} />
      <div className={`absolute top-5 w-32 text-[10px] font-medium ${anchor}`} style={{ color: 'var(--wheat)', textShadow: '0 1px 3px rgba(0,0,0,.9)' }}>{label}</div>
    </div>
  );
};

const RouteChip = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] backdrop-blur" style={{ background: 'rgba(18,21,29,.78)', borderColor: 'var(--border-subtle)', color: 'var(--wheat)' }}>
    <Icon className="h-3.5 w-3.5" style={{ color: 'var(--petrol)' }} /> {label}
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-lg font-semibold" style={{ color: 'var(--wheat)' }}>{value}</div>
    <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>{label}</div>
  </div>
);

const WeatherCard = ({ title, weather }: { title: string; weather?: { label: string; temperatureF: number; windMph: number } | null }) => (
  <div className="rounded-2xl border p-4" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{title}</p>
        <p className="font-semibold" style={{ color: 'var(--wheat)' }}>{weather ? `${weather.label} · ${weather.temperatureF}°F` : 'Weather unavailable'}</p>
      </div>
      <CloudSun className="h-6 w-6" style={{ color: 'var(--petrol)' }} />
    </div>
    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><WindIcon size={16} /> {weather ? `${weather.windMph} mph wind` : 'Neutral flight conditions'}</div>
  </div>
);
