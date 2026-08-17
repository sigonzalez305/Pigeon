package com.pigeon.messenger.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Turns a route distance into a flight duration.
 *
 * Timing is derived from distance so the core fiction holds: a message to the
 * next town arrives sooner than one across the continent. Weather stretches or
 * compresses that, but never decides whether the message is delivered.
 *
 * Test mode compresses every flight into a demo-friendly window. It is a
 * separate, explicit switch rather than the only behaviour, so the real timing
 * model is always the one being scaled.
 */
@Service
public class FlightTimingService {

    /** Homing pigeons cruise at roughly 50-60 mph over open distance. */
    @Value("${pigeon.airspeed-mph:55.0}")
    private double airspeedMph;

    @Value("${pigeon.test-mode:true}")
    private boolean testMode;

    @Value("${pigeon.test-mode.min-seconds:60}")
    private long testModeMinSeconds;

    @Value("${pigeon.test-mode.max-seconds:300}")
    private long testModeMaxSeconds;

    /** A flight always takes some time, even to the same area code. */
    private static final long MIN_REAL_SECONDS = 60;

    /** Bounds on client-supplied weather so a tampered value cannot stall a flight. */
    private static final double MIN_WEATHER_MULTIPLIER = 0.5;
    private static final double MAX_WEATHER_MULTIPLIER = 2.0;

    /**
     * @param distanceMiles      great-circle route distance
     * @param weatherMultiplier  client's live-weather factor; null means neutral
     */
    public Duration flightDuration(double distanceMiles, Double weatherMultiplier) {
        double hours = Math.max(0, distanceMiles) / airspeedMph;
        long realSeconds = Math.max(MIN_REAL_SECONDS, Math.round(hours * 3600));

        // Weather applies before any test-mode compression, so a storm still
        // reads as slower relative to clear skies at the same distance.
        long weathered = Math.round(realSeconds * clampWeather(weatherMultiplier));

        if (!testMode) {
            return Duration.ofSeconds(weathered);
        }

        return Duration.ofSeconds(compressForTesting(weathered));
    }

    private double clampWeather(Double multiplier) {
        if (multiplier == null || multiplier.isNaN() || multiplier.isInfinite()) {
            return 1.0;
        }
        return Math.min(MAX_WEATHER_MULTIPLIER, Math.max(MIN_WEATHER_MULTIPLIER, multiplier));
    }

    /**
     * Maps a real duration onto the test window while preserving ordering, so a
     * longer real flight is still a longer test flight. A cross-country flight
     * (~2500 miles, ~45h) sits at the top of the window; a short hop at the
     * bottom.
     */
    private long compressForTesting(long realSeconds) {
        double referenceSeconds = (2500.0 / airspeedMph) * 3600;
        double ratio = Math.min(1.0, realSeconds / referenceSeconds);
        long span = testModeMaxSeconds - testModeMinSeconds;
        return testModeMinSeconds + Math.round(span * ratio);
    }

    public boolean isTestMode() {
        return testMode;
    }
}
