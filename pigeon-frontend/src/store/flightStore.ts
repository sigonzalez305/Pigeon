import { create } from 'zustand';
import type { FlightWeather } from '../services/weather';
import {
  fetchActiveFlight,
  markFlightArrived,
  type PigeonFlight,
} from '../services/pigeonMessages';

export type FlightStatus = 'preparing' | 'in-flight' | 'approaching' | 'arrived';

export type ActiveFlight = PigeonFlight;

type FlightState = {
  activeFlight: ActiveFlight | null;
  dailyRemaining: number;
  hydrated: boolean;
  originWeather: FlightWeather | null;
  destinationWeather: FlightWeather | null;

  /** Loads server truth. The server, not the browser, owns whether a flight exists. */
  hydrate: () => Promise<void>;
  setActiveFlight: (flight: ActiveFlight) => void;
  setFlightWeather: (flightId: number, origin: FlightWeather | null, destination: FlightWeather | null) => void;
  /** Lands a flight whose ETA has passed, giving the journey an ending. */
  landFlight: () => Promise<void>;
  clearFlight: () => void;
};

/**
 * Only weather is cached locally, and only because it is not stored server-side
 * and is not sensitive.
 *
 * The message body, the recipient's number and the sender's coordinates used to
 * live here in plaintext, indefinitely, on whatever device sent the message —
 * including exact GPS when precision routing was on. They now come from the
 * server on demand and are never written to disk by the client.
 */
const WEATHER_CACHE_KEY = 'pigeon.flight-weather.v1';

type WeatherCache = {
  flightId: number;
  origin: FlightWeather | null;
  destination: FlightWeather | null;
};

const readWeatherCache = (): WeatherCache | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeatherCache) : null;
  } catch {
    return null;
  }
};

const cached = readWeatherCache();

export const useFlightStore = create<FlightState>((set, get) => ({
  activeFlight: null,
  dailyRemaining: 0,
  hydrated: false,
  originWeather: cached?.origin ?? null,
  destinationWeather: cached?.destination ?? null,

  hydrate: async () => {
    try {
      const { flight, dailyRemaining } = await fetchActiveFlight();
      const weather = readWeatherCache();
      const weatherMatches = flight && weather && weather.flightId === flight.id;
      set({
        activeFlight: flight,
        dailyRemaining,
        hydrated: true,
        originWeather: weatherMatches ? weather.origin : null,
        destinationWeather: weatherMatches ? weather.destination : null,
      });
    } catch {
      // Offline or unauthenticated: report no flight rather than inventing one.
      set({ hydrated: true });
    }
  },

  setActiveFlight: (flight) => set({ activeFlight: flight, dailyRemaining: flight.dailyRemaining }),

  setFlightWeather: (flightId, origin, destination) => {
    try {
      localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ flightId, origin, destination }));
    } catch {
      // A full or blocked localStorage must not break the flight.
    }
    set({ originWeather: origin, destinationWeather: destination });
  },

  landFlight: async () => {
    const flight = get().activeFlight;
    if (!flight) return;
    const landed = await markFlightArrived(flight.id);
    if (landed && landed.state !== 'flying') {
      // The flight is over: drop it so the UI stops showing a pigeon that has
      // already arrived, and let the daily allowance reflect server truth.
      get().clearFlight();
      set({ dailyRemaining: landed.dailyRemaining });
    }
  },

  clearFlight: () => {
    try {
      localStorage.removeItem(WEATHER_CACHE_KEY);
    } catch {
      // Ignore: clearing a cache must never throw into the caller.
    }
    set({ activeFlight: null, originWeather: null, destinationWeather: null });
  },
}));

export function flightProgress(flight: Pick<ActiveFlight, 'launchAt' | 'arrivalAt'>, now = Date.now()) {
  const duration = Math.max(1, flight.arrivalAt - flight.launchAt);
  return Math.min(1, Math.max(0, (now - flight.launchAt) / duration));
}

export function flightStatus(flight: Pick<ActiveFlight, 'launchAt' | 'arrivalAt'>, now = Date.now()): FlightStatus {
  const progress = flightProgress(flight, now);
  if (progress >= 1) return 'arrived';
  if (progress >= 0.82) return 'approaching';
  if (progress > 0) return 'in-flight';
  return 'preparing';
}
