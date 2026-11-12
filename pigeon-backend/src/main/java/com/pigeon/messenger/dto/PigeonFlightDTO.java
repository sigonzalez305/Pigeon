package com.pigeon.messenger.dto;

import com.pigeon.messenger.entity.Flight;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZoneOffset;

/**
 * Server-truth view of a flight. Timestamps are epoch milliseconds so the client
 * can do progress math directly against Date.now() without parsing or timezone
 * handling.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PigeonFlightDTO {
    private Long id;
    private Long messageId;
    private Long conversationId;
    private String pigeonName;
    private String recipientPhone;
    private String messageBody;
    private RouteLocationDTO origin;
    private RouteLocationDTO destination;
    private Double distanceMiles;
    private Long launchAt;
    private Long arrivalAt;
    private String state;

    /** Pigeon Messages the sender has left today, after this one. */
    private Integer dailyRemaining;

    public static PigeonFlightDTO fromEntity(Flight flight, String messageBody, Long conversationId, Integer dailyRemaining) {
        PigeonFlightDTO dto = new PigeonFlightDTO();
        dto.setId(flight.getId());
        dto.setMessageId(flight.getMessageId());
        dto.setConversationId(conversationId);
        dto.setPigeonName(flight.getPigeonName());
        dto.setRecipientPhone(flight.getRecipientPhone());
        dto.setMessageBody(messageBody);
        dto.setOrigin(new RouteLocationDTO(
                flight.getOriginSource(),
                flight.getOriginLat(),
                flight.getOriginLon(),
                flight.getOriginRegion()));
        dto.setDestination(new RouteLocationDTO(
                "AREA_CODE",
                flight.getDestinationLat(),
                flight.getDestinationLon(),
                flight.getDestinationRegion()));
        dto.setDistanceMiles(flight.getDistanceMiles());
        if (flight.getDepartAt() != null) {
            dto.setLaunchAt(flight.getDepartAt().toInstant(ZoneOffset.UTC).toEpochMilli());
        }
        if (flight.getEtaAt() != null) {
            dto.setArrivalAt(flight.getEtaAt().toInstant(ZoneOffset.UTC).toEpochMilli());
        }
        dto.setState(flight.getState());
        dto.setDailyRemaining(dailyRemaining);
        return dto;
    }
}
