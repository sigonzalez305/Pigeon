import type { RouteLocation } from './location';

export type FlightWeather = {
  temperatureF: number;
  windMph: number;
  weatherCode: number;
  label: string;
  fetchedAt: string;
};

const weatherLabel = (code: number) => {
  if (code === 0) return 'Clear';
  if ([1, 2].includes(code)) return 'Partly cloudy';
  if (code === 3) return 'Cloudy';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Storm';
  return 'Mixed conditions';
};

export async function fetchFlightWeather(location: RouteLocation): Promise<FlightWeather> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,wind_speed_10m,weather_code',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) throw new Error(`Weather lookup failed (${response.status})`);

  const data = await response.json();
  const current = data?.current;
  if (!current) throw new Error('Weather service returned no current conditions.');

  return {
    temperatureF: Math.round(current.temperature_2m),
    windMph: Math.round(current.wind_speed_10m),
    weatherCode: Number(current.weather_code),
    label: weatherLabel(Number(current.weather_code)),
    fetchedAt: new Date().toISOString(),
  };
}

export function weatherEtaMultiplier(...conditions: Array<FlightWeather | null | undefined>) {
  let multiplier = 1;
  for (const weather of conditions) {
    if (!weather) continue;
    if (weather.windMph >= 25) multiplier += 0.12;
    else if (weather.windMph >= 15) multiplier += 0.06;

    if (weather.label === 'Rain' || weather.label === 'Snow') multiplier += 0.08;
    if (weather.label === 'Storm') multiplier += 0.18;
    if (weather.label === 'Fog') multiplier += 0.05;
  }
  return Math.min(multiplier, 1.45);
}
