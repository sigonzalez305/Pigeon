package com.pigeon.messenger.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Flight duration used to be Math.random() on the client, which meant a message
 * to the next town and one across the continent took the same time. These tests
 * pin the property that replaced it: duration follows distance.
 */
class FlightTimingServiceTest {

    private FlightTimingService service;

    @BeforeEach
    void setUp() {
        service = new FlightTimingService();
        ReflectionTestUtils.setField(service, "airspeedMph", 55.0);
        ReflectionTestUtils.setField(service, "testMode", false);
        ReflectionTestUtils.setField(service, "testModeMinSeconds", 60L);
        ReflectionTestUtils.setField(service, "testModeMaxSeconds", 300L);
    }

    @Test
    void longerRoutesTakeLonger() {
        Duration shortHop = service.flightDuration(50, null);
        Duration mediumRoute = service.flightDuration(926, null);
        Duration crossCountry = service.flightDuration(2435, null);

        assertTrue(shortHop.compareTo(mediumRoute) < 0, "a short hop should beat a 926 mile route");
        assertTrue(mediumRoute.compareTo(crossCountry) < 0, "926 miles should beat 2435 miles");
    }

    @Test
    void durationTracksDistanceOverAirspeed() {
        // 550 miles at 55 mph is 10 hours.
        assertEquals(Duration.ofHours(10), service.flightDuration(550, null));
    }

    @Test
    void everyFlightTakesSomeTime() {
        assertTrue(service.flightDuration(0, null).getSeconds() >= 60);
    }

    @Test
    void badWeatherSlowsTheFlightAndFairWeatherSpeedsIt() {
        Duration neutral = service.flightDuration(550, 1.0);
        Duration stormy = service.flightDuration(550, 1.4);
        Duration clear = service.flightDuration(550, 0.8);

        assertTrue(stormy.compareTo(neutral) > 0);
        assertTrue(clear.compareTo(neutral) < 0);
    }

    @Test
    void clampsHostileWeatherMultipliersSoAFlightCannotStall() {
        Duration absurd = service.flightDuration(550, 1_000_000.0);
        Duration instant = service.flightDuration(550, -5.0);

        assertEquals(Duration.ofHours(20), absurd, "should clamp to the 2.0x ceiling");
        assertEquals(Duration.ofHours(5), instant, "should clamp to the 0.5x floor");
    }

    @Test
    void treatsMissingOrNonsenseWeatherAsNeutral() {
        Duration neutral = service.flightDuration(550, null);
        assertEquals(neutral, service.flightDuration(550, Double.NaN));
        assertEquals(neutral, service.flightDuration(550, Double.POSITIVE_INFINITY));
    }

    @Test
    void testModeCompressesIntoTheWindowButKeepsOrdering() {
        ReflectionTestUtils.setField(service, "testMode", true);

        Duration shortHop = service.flightDuration(50, null);
        Duration crossCountry = service.flightDuration(2435, null);

        assertTrue(shortHop.getSeconds() >= 60 && shortHop.getSeconds() <= 300);
        assertTrue(crossCountry.getSeconds() >= 60 && crossCountry.getSeconds() <= 300);
        assertTrue(shortHop.compareTo(crossCountry) < 0, "test mode must preserve relative distance");
    }

    @Test
    void testModeStaysInsideTheWindowBeyondTheReferenceDistance() {
        ReflectionTestUtils.setField(service, "testMode", true);

        // Further than the compression reference; must not overshoot the ceiling.
        assertTrue(service.flightDuration(12_000, 2.0).getSeconds() <= 300);
    }
}
