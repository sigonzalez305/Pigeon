package com.pigeon.messenger.controller;

import com.pigeon.messenger.dto.MessageDTO;
import com.pigeon.messenger.dto.PigeonFlightDTO;
import com.pigeon.messenger.dto.SendPigeonMessageRequest;
import com.pigeon.messenger.entity.Conversation;
import com.pigeon.messenger.entity.Flight;
import com.pigeon.messenger.entity.Message;
import com.pigeon.messenger.entity.User;
import com.pigeon.messenger.repository.ConversationRepository;
import com.pigeon.messenger.repository.FlightRepository;
import com.pigeon.messenger.repository.MessageRepository;
import com.pigeon.messenger.repository.UserRepository;
import com.pigeon.messenger.security.JwtUtil;
import com.pigeon.messenger.service.FlightTimingService;
import com.pigeon.messenger.util.PhoneNumbers;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * The Pigeon Message send path.
 *
 * A Pigeon Message is two things that must not be confused: a real message that
 * is persisted and delivered reliably, and a flight that is theatre on top of
 * it. The message is written first and is never contingent on the flight; the
 * flight only decides when the ceremony says it landed.
 */
@RestController
@RequestMapping("/api/pigeon-messages")
public class PigeonMessageController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FlightTimingService flightTimingService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Value("${pigeon.daily-limit:1}")
    private int dailyLimit;

    @Value("${pigeon.allow-daily-reset:false}")
    private boolean allowDailyReset;

    @PostMapping
    @Transactional
    public ResponseEntity<?> send(@Valid @RequestBody SendPigeonMessageRequest request,
                                  @RequestHeader("Authorization") String authHeader) {

        Long senderId = jwtUtil.extractUserId(authHeader.substring(7));
        User sender = userRepository.findById(senderId).orElse(null);
        if (sender == null) {
            return error(HttpStatus.UNAUTHORIZED, "unknown_sender", "That account no longer exists.");
        }

        // A retry of a send that already landed must not burn a second daily
        // pigeon, so idempotency is checked before the allowance.
        if (request.getClientNonce() != null && !request.getClientNonce().isBlank()) {
            Optional<Message> existing = messageRepository.findByClientNonce(request.getClientNonce());
            if (existing.isPresent()) {
                Optional<Flight> existingFlight = flightRepository.findByMessageId(existing.get().getId());
                if (existingFlight.isPresent()) {
                    return ResponseEntity.ok(toDto(existingFlight.get(), existing.get(), senderId));
                }
            }
        }

        String recipientDigits = PhoneNumbers.nationalDigits(request.getRecipientPhone());
        if (recipientDigits == null) {
            return error(HttpStatus.BAD_REQUEST, "invalid_recipient",
                    "That does not look like a U.S. phone number.");
        }
        if (recipientDigits.equals(PhoneNumbers.nationalDigits(sender.getPhone()))) {
            return error(HttpStatus.BAD_REQUEST, "self_send",
                    "A pigeon will not carry a message back to the coop it left from.");
        }

        User recipient = userRepository.findByNationalPhoneDigits(recipientDigits).orElse(null);
        if (recipient == null) {
            return error(HttpStatus.NOT_FOUND, "recipient_not_found",
                    "No one on Pigeon is using that number yet.");
        }

        int used = pigeonsUsedToday(senderId);
        if (used >= dailyLimit) {
            return error(HttpStatus.TOO_MANY_REQUESTS, "daily_limit_reached",
                    "You have already sent today's Pigeon Message. One a day is the whole point.");
        }

        if (request.getOrigin() == null || request.getOrigin().getLatitude() == null
                || request.getDestination() == null || request.getDestination().getLatitude() == null) {
            return error(HttpStatus.BAD_REQUEST, "unroutable",
                    "We could not plot a route between those two points.");
        }

        double distance = haversineMiles(
                request.getOrigin().getLatitude(), request.getOrigin().getLongitude(),
                request.getDestination().getLatitude(), request.getDestination().getLongitude());

        Conversation conversation = conversationRepository
                .findByParticipants(senderId, recipient.getId())
                .orElseGet(() -> {
                    Conversation created = new Conversation();
                    created.setParticipantAId(senderId);
                    created.setParticipantBId(recipient.getId());
                    return conversationRepository.save(created);
                });

        // The message is the reliable half: written and durable before any
        // flight exists to animate it.
        Message message = new Message();
        message.setConversationId(conversation.getId());
        message.setSenderId(senderId);
        message.setBody(request.getBody().trim());
        message.setClientNonce(request.getClientNonce());
        message.setStatus("sent");
        message = messageRepository.save(message);

        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);

        Duration duration = flightTimingService.flightDuration(distance, request.getWeatherMultiplier());
        LocalDateTime departAt = LocalDateTime.now(ZoneOffset.UTC);

        Flight flight = new Flight();
        flight.setMessageId(message.getId());
        flight.setPigeonId(request.getPigeonId());
        flight.setPigeonName(request.getPigeonName());
        flight.setSenderId(senderId);
        flight.setRecipientPhone(PhoneNumbers.toE164(request.getRecipientPhone()));
        flight.setDepartAt(departAt);
        flight.setEtaAt(departAt.plus(duration));
        flight.setState("flying");
        flight.setOriginLat(request.getOrigin().getLatitude());
        flight.setOriginLon(request.getOrigin().getLongitude());
        flight.setOriginRegion(request.getOrigin().getDisplayRegion());
        flight.setOriginSource(request.getOrigin().getSource());
        flight.setDestinationLat(request.getDestination().getLatitude());
        flight.setDestinationLon(request.getDestination().getLongitude());
        flight.setDestinationRegion(request.getDestination().getDisplayRegion());
        flight.setDistanceMiles(distance);
        flight = flightRepository.save(flight);

        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend(
                    "/topic/conversations/" + conversation.getId(), MessageDTO.fromEntity(message));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(flight, message, senderId));
    }

    /** The sender's current flight, if one is still in the air. */
    @GetMapping("/active")
    public ResponseEntity<?> active(@RequestHeader("Authorization") String authHeader) {
        Long senderId = jwtUtil.extractUserId(authHeader.substring(7));

        List<Flight> flying = flightRepository.findBySenderIdAndStateOrderByDepartAtDesc(senderId, "flying");
        if (flying.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "activeFlight", java.util.Optional.empty(),
                    "dailyRemaining", Math.max(0, dailyLimit - pigeonsUsedToday(senderId))));
        }

        Flight flight = flying.get(0);
        Message message = messageRepository.findById(flight.getMessageId()).orElse(null);
        return ResponseEntity.ok(Map.of(
                "activeFlight", toDto(flight, message, senderId),
                "dailyRemaining", Math.max(0, dailyLimit - pigeonsUsedToday(senderId))));
    }

    /**
     * Marks a flight delivered once its ETA has passed. This is the arrival
     * boundary: it is what gives the flight an ending instead of leaving it in
     * the air forever.
     */
    @PostMapping("/{flightId}/arrive")
    @Transactional
    public ResponseEntity<?> arrive(@PathVariable Long flightId,
                                    @RequestHeader("Authorization") String authHeader) {
        Long senderId = jwtUtil.extractUserId(authHeader.substring(7));

        Flight flight = flightRepository.findById(flightId).orElse(null);
        if (flight == null || !senderId.equals(flight.getSenderId())) {
            return error(HttpStatus.NOT_FOUND, "flight_not_found", "That flight is not yours to land.");
        }

        if ("flying".equals(flight.getState())) {
            if (flight.getEtaAt() != null && LocalDateTime.now(ZoneOffset.UTC).isBefore(flight.getEtaAt())) {
                return error(HttpStatus.CONFLICT, "still_flying", "That pigeon is still in the air.");
            }
            flight.setState("delivered");
            flight = flightRepository.save(flight);

            Message message = messageRepository.findById(flight.getMessageId()).orElse(null);
            if (message != null) {
                message.setStatus("delivered");
                messageRepository.save(message);
            }
        }

        Message message = messageRepository.findById(flight.getMessageId()).orElse(null);
        return ResponseEntity.ok(toDto(flight, message, senderId));
    }

    /**
     * The "Reset Daily Pigeon" developer control. Off unless explicitly enabled,
     * so it cannot quietly dissolve the daily limit in a real deployment.
     */
    @PostMapping("/reset-daily")
    @Transactional
    public ResponseEntity<?> resetDaily(@RequestHeader("Authorization") String authHeader) {
        if (!allowDailyReset) {
            return error(HttpStatus.FORBIDDEN, "reset_disabled",
                    "Daily reset is not enabled in this environment.");
        }

        Long senderId = jwtUtil.extractUserId(authHeader.substring(7));
        List<Flight> today = flightRepository.findBySenderIdOrderByDepartAtDesc(senderId).stream()
                .filter(flight -> flight.getDepartAt() != null && flight.getDepartAt().isAfter(startOfTodayUtc()))
                .toList();

        // Backdate rather than delete: the flights and their messages are real
        // history, and deleting them would take the delivered messages with them.
        today.forEach(flight -> {
            flight.setDepartAt(flight.getDepartAt().minusDays(1));
            if (flight.getEtaAt() != null) {
                flight.setEtaAt(flight.getEtaAt().minusDays(1));
            }
            if ("flying".equals(flight.getState())) {
                flight.setState("delivered");
            }
        });
        flightRepository.saveAll(today);

        return ResponseEntity.ok(Map.of(
                "reset", today.size(),
                "dailyRemaining", Math.max(0, dailyLimit - pigeonsUsedToday(senderId))));
    }

    private PigeonFlightDTO toDto(Flight flight, Message message, Long senderId) {
        Long conversationId = message == null ? null : message.getConversationId();
        String body = message == null ? null : message.getBody();
        return PigeonFlightDTO.fromEntity(flight, body, conversationId,
                Math.max(0, dailyLimit - pigeonsUsedToday(senderId)));
    }

    private int pigeonsUsedToday(Long senderId) {
        return (int) flightRepository.countBySenderIdAndDepartAtGreaterThanEqual(senderId, startOfTodayUtc());
    }

    private LocalDateTime startOfTodayUtc() {
        return LocalDate.now(ZoneOffset.UTC).atStartOfDay();
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of("code", code, "message", message));
    }

    /** Route distance in miles; mirrors the client's distanceMiles so both agree. */
    private double haversineMiles(double lat1, double lon1, double lat2, double lon2) {
        double earthRadiusMiles = 3958.7613;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.pow(Math.sin(dLon / 2), 2);
        return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
