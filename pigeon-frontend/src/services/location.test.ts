import { describe, expect, it } from 'vitest';
import { distanceMiles, parseUsAreaCode, resolveAreaCodeLocation, type AreaCodeRecord } from './location';

describe('parseUsAreaCode', () => {
  it('reads the area code from common written forms', () => {
    expect(parseUsAreaCode('(305) 555-0178')).toBe('305');
    expect(parseUsAreaCode('305-555-0178')).toBe('305');
    expect(parseUsAreaCode('3055550178')).toBe('305');
  });

  it('drops a leading NANP country code', () => {
    expect(parseUsAreaCode('+1 305 555 0178')).toBe('305');
    expect(parseUsAreaCode('13055550178')).toBe('305');
  });

  it('rejects area codes beginning with 0 or 1, which NANP forbids', () => {
    // The seeded demo numbers used to look like this, which made every route
    // between demo accounts unresolvable.
    expect(parseUsAreaCode('+0987654321')).toBeNull();
    expect(parseUsAreaCode('1112223333')).toBeNull();
  });

  it('rejects numbers that are too short to carry an area code', () => {
    expect(parseUsAreaCode('555-0178')).toBeNull();
    expect(parseUsAreaCode('')).toBeNull();
  });
});

describe('resolveAreaCodeLocation', () => {
  const records: readonly AreaCodeRecord[] = [
    { areaCode: '305', state: 'FL', displayRegion: 'Miami, FL', latitude: 25.7617, longitude: -80.1918 },
  ];

  it('resolves a known area code to its centroid', () => {
    const location = resolveAreaCodeLocation('(305) 555-0178', records);
    expect(location?.displayRegion).toBe('Miami, FL');
    expect(location?.source).toBe('AREA_CODE');
  });

  it('returns null rather than inventing coordinates for an unknown area code', () => {
    expect(resolveAreaCodeLocation('(999) 555-0000', records)).toBeNull();
  });
});

describe('distanceMiles', () => {
  const dc = { source: 'AREA_CODE' as const, latitude: 38.9072, longitude: -77.0369, displayRegion: 'DC' };
  const miami = { source: 'AREA_CODE' as const, latitude: 25.7617, longitude: -80.1918, displayRegion: 'Miami' };
  const sf = { source: 'AREA_CODE' as const, latitude: 37.7749, longitude: -122.4194, displayRegion: 'SF' };

  it('matches the known great-circle distance', () => {
    expect(distanceMiles(dc, miami)).toBeGreaterThan(900);
    expect(distanceMiles(dc, miami)).toBeLessThan(950);
  });

  it('is zero for a route to the same point', () => {
    expect(distanceMiles(dc, dc)).toBeCloseTo(0, 5);
  });

  it('orders routes by actual separation, which flight timing depends on', () => {
    expect(distanceMiles(dc, sf)).toBeGreaterThan(distanceMiles(dc, miami));
  });
});
