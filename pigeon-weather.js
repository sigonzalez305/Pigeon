/**
 * PIGEON - Weather Module
 *
 * Deterministic weather system with real API integration (optional)
 * and mock fallback. No random behavior.
 */

import { logInfo, logError, logWarning } from './pigeon-debug.js';

const WEATHER_API_KEY = window.PIGEON_WEATHER_API_KEY || null;
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';

/**
 * Deterministic mock weather based on location
 * Same location always returns same weather
 */
function getDeterministicMockWeather(areaCode) {
  // Use area code to generate consistent weather
  const code = parseInt(areaCode) || 555;

  // Hash area code to weather patterns
  const patterns = [
    { condition: 'Clear', temp: 72, icon: '☀️', multiplier: 1.0 },
    { condition: 'Partly Cloudy', temp: 68, icon: '⛅', multiplier: 1.1 },
    { condition: 'Cloudy', temp: 65, icon: '☁️', multiplier: 1.2 },
    { condition: 'Light Rain', temp: 58, icon: '🌦️', multiplier: 1.3 },
    { condition: 'Rain', temp: 55, icon: '🌧️', multiplier: 1.5 },
    { condition: 'Thunderstorm', temp: 60, icon: '⛈️', multiplier: 2.0 },
    { condition: 'Snow', temp: 32, icon: '❄️', multiplier: 2.5 },
    { condition: 'Fog', temp: 50, icon: '🌫️', multiplier: 1.4 },
  ];

  const index = code % patterns.length;
  const pattern = patterns[index];

  return {
    condition: pattern.condition,
    temperature: pattern.temp,
    icon: pattern.icon,
    delayMultiplier: pattern.multiplier,
    isLive: false,
  };
}

/**
 * Fetch real weather data from API
 */
async function fetchLiveWeather(areaCode) {
  if (!WEATHER_API_KEY) {
    logWarning('Weather API key not found, using mock data');
    return null;
  }

  try {
    // For simplicity, we'll use area code as zip code
    // In production, you'd map area codes to actual cities
    const url = `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${areaCode}&aqi=no`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Map weather condition to delay multiplier
    const condition = data.current.condition.text.toLowerCase();
    let multiplier = 1.0;

    if (condition.includes('rain') || condition.includes('drizzle')) {
      multiplier = 1.5;
    } else if (condition.includes('storm') || condition.includes('thunder')) {
      multiplier = 2.0;
    } else if (condition.includes('snow') || condition.includes('blizzard')) {
      multiplier = 2.5;
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
      multiplier = 1.2;
    } else if (condition.includes('fog') || condition.includes('mist')) {
      multiplier = 1.4;
    }

    return {
      condition: data.current.condition.text,
      temperature: Math.round(data.current.temp_f),
      icon: data.current.condition.icon,
      delayMultiplier: multiplier,
      location: `${data.location.name}, ${data.location.region}`,
      isLive: true,
    };
  } catch (error) {
    logError('Failed to fetch live weather', error);
    return null;
  }
}

/**
 * Get weather for a location (area code)
 * Tries live API first, falls back to deterministic mock
 */
export async function getWeather(areaCode) {
  logInfo(`Checking weather for area code: ${areaCode}`);

  // Try live weather first
  const liveWeather = await fetchLiveWeather(areaCode);

  if (liveWeather) {
    logInfo('Using live weather data', liveWeather);
    return liveWeather;
  }

  // Fall back to deterministic mock
  const mockWeather = getDeterministicMockWeather(areaCode);
  logInfo('Using deterministic mock weather', mockWeather);

  return mockWeather;
}

/**
 * Get weather for both sender and receiver
 * Returns combined weather impact
 */
export async function getRouteWeather(fromAreaCode, toAreaCode) {
  const [fromWeather, toWeather] = await Promise.all([
    getWeather(fromAreaCode),
    getWeather(toAreaCode),
  ]);

  // Use worst weather conditions for flight delay
  const maxMultiplier = Math.max(
    fromWeather.delayMultiplier,
    toWeather.delayMultiplier
  );

  return {
    from: fromWeather,
    to: toWeather,
    delayMultiplier: maxMultiplier,
    isLive: fromWeather.isLive || toWeather.isLive,
  };
}

/**
 * Calculate delivery delay based on distance and weather
 */
export function calculateDelivery(distanceMiles, weatherMultiplier) {
  // Base calculation: 1 mile = 1 minute (simplified)
  // Weather multiplier increases time
  const baseMinutes = distanceMiles;
  const delayedMinutes = baseMinutes * weatherMultiplier;

  return {
    baseMinutes: Math.round(baseMinutes),
    delayedMinutes: Math.round(delayedMinutes),
    weatherImpact: weatherMultiplier,
  };
}

/**
 * Calculate distance between two area codes (simplified)
 * In production, you'd use actual lat/long coordinates
 */
export function calculateDistance(fromAreaCode, toAreaCode) {
  // Simplified: use area code difference as proxy for distance
  const from = parseInt(fromAreaCode) || 0;
  const to = parseInt(toAreaCode) || 0;
  const diff = Math.abs(from - to);

  // Scale to reasonable mile range (10-500 miles)
  const miles = Math.min(500, Math.max(10, diff * 5));

  return miles;
}

/**
 * Format weather description
 */
export function formatWeatherDescription(weather) {
  if (!weather) return 'Unknown conditions';

  const source = weather.isLive ? '🌐 Live' : '🎭 Mock';
  const temp = typeof weather.temperature === 'number'
    ? `${weather.temperature}°F`
    : 'N/A';

  return `${source} | ${weather.condition} | ${temp}`;
}
