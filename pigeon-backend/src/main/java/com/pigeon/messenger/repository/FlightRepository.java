package com.pigeon.messenger.repository;

import com.pigeon.messenger.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    Optional<Flight> findByMessageId(Long messageId);

    /** Backs the daily Pigeon Message allowance. */
    long countBySenderIdAndDepartAtGreaterThanEqual(Long senderId, LocalDateTime since);

    /** Most recent first; the head of this list is the sender's current flight. */
    List<Flight> findBySenderIdOrderByDepartAtDesc(Long senderId);

    List<Flight> findBySenderIdAndStateOrderByDepartAtDesc(Long senderId, String state);
}
