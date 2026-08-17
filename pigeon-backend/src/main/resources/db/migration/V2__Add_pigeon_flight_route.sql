-- Pigeon Message flights carry a route, not just a timing window.
--
-- V1 created the flights table with message_id / pigeon_id / depart_at / eta_at
-- only, which is enough to time a flight but not enough to redraw one. The
-- client previously held the route in localStorage, so a flight could not be
-- resumed on another device and was lost when site data was cleared. These
-- columns make the server the source of truth for the route as well.

ALTER TABLE flights
    ADD COLUMN sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    ADD COLUMN recipient_phone VARCHAR(20),
    ADD COLUMN pigeon_name VARCHAR(50),
    ADD COLUMN origin_lat DOUBLE PRECISION,
    ADD COLUMN origin_lon DOUBLE PRECISION,
    ADD COLUMN origin_region VARCHAR(120),
    -- Which resolver produced the origin: AREA_CODE, APPROXIMATE, PRECISE, UNKNOWN.
    ADD COLUMN origin_source VARCHAR(20),
    ADD COLUMN destination_lat DOUBLE PRECISION,
    ADD COLUMN destination_lon DOUBLE PRECISION,
    ADD COLUMN destination_region VARCHAR(120),
    ADD COLUMN distance_miles DOUBLE PRECISION;

-- The daily Pigeon Message allowance is a per-sender count over a date range,
-- and the active-flight lookup is the same query bounded to one row.
CREATE INDEX idx_flights_sender_depart ON flights(sender_id, depart_at DESC);
