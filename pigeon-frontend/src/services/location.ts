export type LocationSource = 'AREA_CODE' | 'APPROXIMATE' | 'PRECISE' | 'UNKNOWN';

export interface RouteLocation {
  source: LocationSource;
  latitude: number;
  longitude: number;
  displayRegion: string;
  precisionRadiusMiles?: number;
  areaCode?: string;
  capturedAt?: string;
}

export interface AreaCodeRecord {
  areaCode: string;
  state: string;
  displayRegion: string;
  latitude: number;
  longitude: number;
  precisionRadiusMiles?: number;
}

/**
 * Area-code data is intentionally injected rather than hard-coded here.
 * The production dataset must contain the complete active U.S. NANP area-code
 * set and approximate geographic centroids. This keeps routing independent of
 * the data source and allows the dataset to be updated without changing flight logic.
 */
export function resolveAreaCodeLocation(
  phoneNumber: string,
  records: readonly AreaCodeRecord[],
): RouteLocation | null {
  const areaCode = parseUsAreaCode(phoneNumber);
  if (!areaCode) return null;

  const match = records.find((record) => record.areaCode === areaCode);
  if (!match) return null;

  return {
    source: 'AREA_CODE',
    latitude: match.latitude,
    longitude: match.longitude,
    displayRegion: match.displayRegion || match.state,
    precisionRadiusMiles: match.precisionRadiusMiles,
    areaCode,
  };
}

export function parseUsAreaCode(phoneNumber: string): string | null {
  const digits = phoneNumber.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (national.length < 10) return null;

  const areaCode = national.slice(0, 3);
  // NANP area codes cannot begin with 0 or 1.
  return /^[2-9]\d{2}$/.test(areaCode) ? areaCode : null;
}

/**
 * Precision Routing is explicit opt-in. Calling this function should only
 * happen after a user action that clearly asks to enable/use precise location.
 * Coordinates are returned for internal routing; UI should normally expose
 * only a coarse display label unless the user separately chooses to share more.
 */
export async function requestPreciseLocation(
  displayRegion = 'Current location',
): Promise<RouteLocation> {
  if (!('geolocation' in navigator)) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 60_000,
    });
  });

  return {
    source: 'PRECISE',
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    displayRegion,
    precisionRadiusMiles: metersToMiles(position.coords.accuracy),
    capturedAt: new Date(position.timestamp).toISOString(),
  };
}

export function distanceMiles(origin: RouteLocation, destination: RouteLocation): number {
  const earthRadiusMiles = 3958.7613;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function metersToMiles(meters: number): number {
  return meters / 1609.344;
}
