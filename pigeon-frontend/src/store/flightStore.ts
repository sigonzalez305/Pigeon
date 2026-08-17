import { create } from 'zustand';
import type { RouteLocation } from '../services/location';
import type { FlightWeather } from '../services/weather';

export type FlightStatus = 'preparing' | 'in-flight' | 'approaching' | 'arrived';

export type ActiveFlight = {
  id: string;
  pigeonName: string;
  recipientPhone: string;
  messageBody: string;
  origin: RouteLocation;
  destination: RouteLocation;
  distanceMiles: number;
  launchAt: number;
  arrivalAt: number;
  originWeather?: FlightWeather | null;
  destinationWeather?: FlightWeather | null;
};

type FlightState = {
  activeFlight: ActiveFlight | null;
  setActiveFlight: (flight: ActiveFlight) => void;
  clearFlight: () => void;
};

const STORAGE_KEY = 'pigeon.active-flight.v1';

const readStoredFlight = (): ActiveFlight | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useFlightStore = create<FlightState>((set) => ({
  activeFlight: readStoredFlight(),
  setActiveFlight: (flight) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flight));
    set({ activeFlight: flight });
  },
  clearFlight: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ activeFlight: null });
  },
}));

export function flightProgress(flight: ActiveFlight, now = Date.now()) {
  const duration = Math.max(1, flight.arrivalAt - flight.launchAt);
  return Math.min(1, Math.max(0, (now - flight.launchAt) / duration));
}

export function flightStatus(flight: ActiveFlight, now = Date.now()): FlightStatus {
  const progress = flightProgress(flight, now);
  if (progress >= 1) return 'arrived';
  if (progress >= 0.82) return 'approaching';
  if (progress > 0) return 'in-flight';
  return 'preparing';
}
