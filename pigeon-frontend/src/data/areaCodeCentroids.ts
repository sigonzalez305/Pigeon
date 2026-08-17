import type { AreaCodeRecord } from '../services/location';

/**
 * MVP seed records for current demos. The resolver is intentionally data-driven.
 * This file must be replaced/expanded from the official NANPA NPA database before production launch.
 */
export const AREA_CODE_CENTROIDS: readonly AreaCodeRecord[] = [
  { areaCode: '202', state: 'DC', displayRegion: 'Washington, DC', latitude: 38.9072, longitude: -77.0369, precisionRadiusMiles: 18 },
  { areaCode: '301', state: 'MD', displayRegion: 'Maryland (DC suburbs)', latitude: 39.0458, longitude: -76.6413, precisionRadiusMiles: 60 },
  { areaCode: '240', state: 'MD', displayRegion: 'Maryland (DC suburbs)', latitude: 39.0458, longitude: -76.6413, precisionRadiusMiles: 60 },
  { areaCode: '305', state: 'FL', displayRegion: 'Miami, FL', latitude: 25.7617, longitude: -80.1918, precisionRadiusMiles: 45 },
  { areaCode: '786', state: 'FL', displayRegion: 'Miami, FL', latitude: 25.7617, longitude: -80.1918, precisionRadiusMiles: 45 },
  { areaCode: '954', state: 'FL', displayRegion: 'Fort Lauderdale, FL', latitude: 26.1224, longitude: -80.1373, precisionRadiusMiles: 40 },
  { areaCode: '754', state: 'FL', displayRegion: 'Fort Lauderdale, FL', latitude: 26.1224, longitude: -80.1373, precisionRadiusMiles: 40 },
  { areaCode: '212', state: 'NY', displayRegion: 'New York, NY', latitude: 40.7128, longitude: -74.0060, precisionRadiusMiles: 18 },
  { areaCode: '332', state: 'NY', displayRegion: 'New York, NY', latitude: 40.7128, longitude: -74.0060, precisionRadiusMiles: 18 },
  { areaCode: '646', state: 'NY', displayRegion: 'New York, NY', latitude: 40.7128, longitude: -74.0060, precisionRadiusMiles: 18 },
  { areaCode: '917', state: 'NY', displayRegion: 'New York City, NY', latitude: 40.7128, longitude: -74.0060, precisionRadiusMiles: 28 },
  { areaCode: '213', state: 'CA', displayRegion: 'Los Angeles, CA', latitude: 34.0522, longitude: -118.2437, precisionRadiusMiles: 35 },
  { areaCode: '323', state: 'CA', displayRegion: 'Los Angeles, CA', latitude: 34.0522, longitude: -118.2437, precisionRadiusMiles: 35 },
  { areaCode: '310', state: 'CA', displayRegion: 'Los Angeles, CA', latitude: 34.0522, longitude: -118.2437, precisionRadiusMiles: 45 },
  { areaCode: '415', state: 'CA', displayRegion: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194, precisionRadiusMiles: 35 },
  { areaCode: '628', state: 'CA', displayRegion: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194, precisionRadiusMiles: 35 },
  { areaCode: '312', state: 'IL', displayRegion: 'Chicago, IL', latitude: 41.8781, longitude: -87.6298, precisionRadiusMiles: 25 },
  { areaCode: '773', state: 'IL', displayRegion: 'Chicago, IL', latitude: 41.8781, longitude: -87.6298, precisionRadiusMiles: 30 },
  { areaCode: '404', state: 'GA', displayRegion: 'Atlanta, GA', latitude: 33.7490, longitude: -84.3880, precisionRadiusMiles: 35 },
  { areaCode: '470', state: 'GA', displayRegion: 'Atlanta, GA', latitude: 33.7490, longitude: -84.3880, precisionRadiusMiles: 55 },
  { areaCode: '617', state: 'MA', displayRegion: 'Boston, MA', latitude: 42.3601, longitude: -71.0589, precisionRadiusMiles: 30 },
  { areaCode: '857', state: 'MA', displayRegion: 'Boston, MA', latitude: 42.3601, longitude: -71.0589, precisionRadiusMiles: 30 },
  { areaCode: '206', state: 'WA', displayRegion: 'Seattle, WA', latitude: 47.6062, longitude: -122.3321, precisionRadiusMiles: 35 },
  { areaCode: '702', state: 'NV', displayRegion: 'Las Vegas, NV', latitude: 36.1699, longitude: -115.1398, precisionRadiusMiles: 45 },
  { areaCode: '214', state: 'TX', displayRegion: 'Dallas, TX', latitude: 32.7767, longitude: -96.7970, precisionRadiusMiles: 45 },
  { areaCode: '469', state: 'TX', displayRegion: 'Dallas, TX', latitude: 32.7767, longitude: -96.7970, precisionRadiusMiles: 55 },
  { areaCode: '713', state: 'TX', displayRegion: 'Houston, TX', latitude: 29.7604, longitude: -95.3698, precisionRadiusMiles: 50 },
  { areaCode: '281', state: 'TX', displayRegion: 'Houston, TX', latitude: 29.7604, longitude: -95.3698, precisionRadiusMiles: 65 },
];
