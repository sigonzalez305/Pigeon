import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CloudSun, MapPin, Navigation, Wind } from 'lucide-react';
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
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(8, Math.min(92, y)) };
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
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!activeFlight) {
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

  const progress = flightProgress(activeFlight, now);
  const status = flightStatus(activeFlight, now);
  const origin = project(activeFlight.origin.latitude, activeFlight.origin.longitude);
  const destination = project(activeFlight.destination.latitude, activeFlight.destination.longitude);
  const pigeon = {
    x: origin.x + (destination.x - origin.x) * progress,
    y: origin.y + (destination.y - origin.y) * progress - Math.sin(progress * Math.PI) * 16,
  };
  const milesRemaining = Math.max(0, Math.round(activeFlight.distanceMiles * (1 - progress)));
  const remaining = activeFlight.arrivalAt - now;

  return (
    <div className="min-h-full p-4" style={{ background: 'var(--slate-dusk)' }}>
      <header className="mb-4 flex items-center gap-3">
        <button onClick={() => navigate('/home')} className="rounded-full p-2" aria-label="Back to Coop Town"><ArrowLeft className="h-5 w-5" /></button>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: 'var(--petrol)' }}>Live Flight</p>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--wheat)' }}>{activeFlight.pigeonName} is {status === 'arrived' ? 'there' : 'in the air'}</h1>
        </div>
      </header>

      <section className="overflow-hidden rounded-[30px] border" style={{ background: 'linear-gradient(180deg,#283149 0%,#151924 72%)', borderColor: 'var(--border-subtle)' }}>
        <div className="relative aspect-[4/3] min-h-[330px] overflow-hidden">
          <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 20% 24%, rgba(232,217,181,.18) 0 1px, transparent 2px), radial-gradient(circle at 74% 35%, rgba(232,217,181,.12) 0 1px, transparent 2px)', backgroundSize: '48px 48px,64px 64px' }} />

          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M7 33 L16 19 L31 14 L42 17 L50 22 L59 18 L72 24 L82 31 L91 47 L89 62 L78 72 L67 77 L57 72 L47 82 L34 77 L28 67 L18 61 L11 50 Z" fill="rgba(138,147,166,.12)" stroke="rgba(232,217,181,.15)" strokeWidth=".7" />
            <path d={`M ${origin.x} ${origin.y} Q ${(origin.x + destination.x) / 2} ${Math.min(origin.y, destination.y) - 22} ${destination.x} ${destination.y}`} fill="none" stroke="rgba(47,191,163,.28)" strokeDasharray="2.2 2.2" strokeWidth="1.1" />
          </svg>

          <MapMarker x={origin.x} y={origin.y} label={activeFlight.origin.displayRegion} tone="origin" />
          <MapMarker x={destination.x} y={destination.y} label={activeFlight.destination.displayRegion} tone="destination" />

          <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${pigeon.x}%`, top: `${pigeon.y}%` }}>
            <PicoSprite animation={status === 'arrived' ? 'deliver' : progress > 0.72 ? 'glide' : 'flap'} size={86} fallbackLabel={activeFlight.pigeonName} />
          </div>

          <div className="absolute left-4 right-4 top-4 flex justify-between gap-2">
            <RouteChip icon={MapPin} label={activeFlight.origin.source === 'PRECISE' ? 'Precision origin' : 'Area-code origin'} />
            <RouteChip icon={Navigation} label={`${Math.round(activeFlight.distanceMiles)} mi`} />
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
        <WeatherCard title={activeFlight.origin.displayRegion} weather={activeFlight.originWeather} />
        <WeatherCard title={activeFlight.destination.displayRegion} weather={activeFlight.destinationWeather} />
      </section>

      <section className="mt-4 rounded-2xl border p-4" style={{ background: 'var(--coop-char)', borderColor: 'var(--border-subtle)' }}>
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--text-secondary)' }}>Scroll</p>
        <p className="mt-2 leading-relaxed" style={{ color: 'var(--wheat)' }}>“{activeFlight.messageBody}”</p>
      </section>
    </div>
  );
};

const MapMarker = ({ x, y, label, tone }: { x: number; y: number; label: string; tone: 'origin' | 'destination' }) => (
  <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
    <div className="h-4 w-4 rounded-full border-2 shadow-lg" style={{ borderColor: tone === 'origin' ? 'var(--petrol)' : 'var(--feather-magenta)', background: 'var(--slate-dusk)' }} />
    <div className="absolute left-1/2 top-5 w-28 -translate-x-1/2 text-center text-[9px] font-medium" style={{ color: 'var(--wheat)' }}>{label}</div>
  </div>
);

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
    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}><Wind className="h-4 w-4" /> {weather ? `${weather.windMph} mph wind` : 'Neutral flight conditions'}</div>
  </div>
);
