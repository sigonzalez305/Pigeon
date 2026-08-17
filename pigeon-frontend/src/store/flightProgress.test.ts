import { describe, expect, it } from 'vitest';
import { flightProgress, flightStatus } from './flightStore';

const flight = { launchAt: 1_000_000, arrivalAt: 1_000_000 + 100_000 };

describe('flightProgress', () => {
  it('is clamped to the 0..1 range outside the flight window', () => {
    expect(flightProgress(flight, flight.launchAt - 50_000)).toBe(0);
    expect(flightProgress(flight, flight.arrivalAt + 50_000)).toBe(1);
  });

  it('reports the fraction elapsed during the flight', () => {
    expect(flightProgress(flight, flight.launchAt + 50_000)).toBeCloseTo(0.5, 5);
  });

  it('does not divide by zero when launch and arrival coincide', () => {
    const instant = { launchAt: 5_000, arrivalAt: 5_000 };
    expect(Number.isFinite(flightProgress(instant, 5_000))).toBe(true);
  });
});

describe('flightStatus', () => {
  it('reports arrived once the ETA has passed', () => {
    expect(flightStatus(flight, flight.arrivalAt)).toBe('arrived');
    expect(flightStatus(flight, flight.arrivalAt + 1)).toBe('arrived');
  });

  it('reports approaching in the final stretch', () => {
    expect(flightStatus(flight, flight.launchAt + 90_000)).toBe('approaching');
  });

  it('reports in-flight between launch and the final stretch', () => {
    expect(flightStatus(flight, flight.launchAt + 40_000)).toBe('in-flight');
  });

  it('reports preparing at the instant of launch', () => {
    expect(flightStatus(flight, flight.launchAt)).toBe('preparing');
  });
});
