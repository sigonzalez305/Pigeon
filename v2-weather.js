import { setWeatherState } from './v2-state.js';

function mockWeather(location) {
  const normalized = location.toLowerCase();
  if (normalized.includes('dc')) {
    return {
      status: 'Cloudy',
      tempF: 58,
      description: 'Overcast with a gentle breeze',
    };
  }
  if (normalized.includes('miami')) {
    return {
      status: 'Sunny',
      tempF: 78,
      description: 'Sunrise warmth with coastal humidity',
    };
  }
  return {
    status: 'Clear',
    tempF: 65,
    description: 'Stable skies with a calm tailwind',
  };
}

export async function fetchWeather(location) {
  const apiKey = window.PIGEON_WEATHER_API_KEY || null;
  const timestamp = new Date().toISOString();
  const baseResult = {
    location,
    lastCheckedAt: timestamp,
  };

  if (!apiKey) {
    const mock = mockWeather(location);
    const result = { ...baseResult, ...mock, usingMock: true };
    setWeatherState(result);
    return result;
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${encodeURIComponent(apiKey)}&q=${encodeURIComponent(location)}`,
    );
    const payload = await response.json();
    const current = payload?.current;
    const condition = current?.condition?.text ?? 'Clear';
    const result = {
      ...baseResult,
      status: condition,
      tempF: current?.temp_f ?? null,
      description: condition,
      usingMock: false,
    };
    setWeatherState(result);
    return result;
  } catch (err) {
    console.error('Weather lookup failed, using mock', err);
    const mock = mockWeather(location);
    const result = { ...baseResult, ...mock, usingMock: true, description: `${mock.description} (mock fallback)` };
    setWeatherState(result);
    return result;
  }
}
