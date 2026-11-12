import axios from 'axios';
import type { RouteLocation } from './location';

export type PigeonFlight = {
  id: number;
  messageId: number;
  conversationId: number | null;
  pigeonName: string;
  recipientPhone: string;
  messageBody: string | null;
  origin: RouteLocation;
  destination: RouteLocation;
  distanceMiles: number;
  launchAt: number;
  arrivalAt: number;
  state: 'flying' | 'delivered' | 'returned';
  dailyRemaining: number;
};

export type SendPigeonMessageInput = {
  recipientPhone: string;
  body: string;
  pigeonId?: number | null;
  pigeonName?: string;
  clientNonce: string;
  origin: RouteLocation;
  destination: RouteLocation;
  weatherMultiplier?: number;
};

/**
 * A send failure the user can act on, carrying the server's error code so the
 * UI can distinguish "you already sent today's pigeon" from "that number is not
 * on Pigeon yet" without parsing prose.
 */
export class PigeonSendError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'PigeonSendError';
    this.code = code;
  }
}

const asRouteLocation = (raw: any, fallbackSource: RouteLocation['source']): RouteLocation => ({
  source: raw?.source ?? fallbackSource,
  latitude: raw?.latitude ?? 0,
  longitude: raw?.longitude ?? 0,
  displayRegion: raw?.displayRegion ?? 'Unknown',
});

const toFlight = (raw: any): PigeonFlight => ({
  ...raw,
  origin: asRouteLocation(raw?.origin, 'AREA_CODE'),
  destination: asRouteLocation(raw?.destination, 'AREA_CODE'),
});

export async function sendPigeonMessage(input: SendPigeonMessageInput): Promise<PigeonFlight> {
  try {
    const response = await axios.post('/api/pigeon-messages', {
      recipientPhone: input.recipientPhone,
      body: input.body,
      pigeonId: input.pigeonId ?? null,
      pigeonName: input.pigeonName,
      clientNonce: input.clientNonce,
      origin: input.origin,
      destination: input.destination,
      weatherMultiplier: input.weatherMultiplier,
    });
    return toFlight(response.data);
  } catch (error: any) {
    const data = error?.response?.data;
    if (data?.code) throw new PigeonSendError(data.code, data.message);
    throw new PigeonSendError(
      'network_error',
      'We could not reach the loft. Your message has not been sent — check your connection and try again.',
    );
  }
}

export async function fetchActiveFlight(): Promise<{ flight: PigeonFlight | null; dailyRemaining: number }> {
  const response = await axios.get('/api/pigeon-messages/active');
  const raw = response.data?.activeFlight;
  const hasFlight = raw && typeof raw === 'object' && raw.id != null;
  return {
    flight: hasFlight ? toFlight(raw) : null,
    dailyRemaining: response.data?.dailyRemaining ?? 0,
  };
}

/** Lands a flight whose ETA has passed. Safe to call more than once. */
export async function markFlightArrived(flightId: number): Promise<PigeonFlight | null> {
  try {
    const response = await axios.post(`/api/pigeon-messages/${flightId}/arrive`);
    return toFlight(response.data);
  } catch {
    // A flight that is still in the air, or already landed by another tab, is
    // not an error worth surfacing: the next poll reconciles it.
    return null;
  }
}

export async function resetDailyPigeon(): Promise<void> {
  await axios.post('/api/pigeon-messages/reset-daily');
}
