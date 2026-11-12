package com.pigeon.messenger.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendPigeonMessageRequest {

    @NotBlank(message = "A recipient phone number is required.")
    private String recipientPhone;

    @NotBlank(message = "A Pigeon Message cannot be empty.")
    @Size(max = 300, message = "A scroll is limited to 300 characters.")
    private String body;

    private Long pigeonId;
    private String pigeonName;

    /** Client-generated idempotency key; a retry with the same nonce returns the original flight. */
    private String clientNonce;

    @NotNull(message = "An origin is required to plot the route.")
    private RouteLocationDTO origin;

    @NotNull(message = "A destination is required to plot the route.")
    private RouteLocationDTO destination;

    /**
     * Live-weather ETA multiplier from the client's sky check. The server clamps
     * it, so a tampered value cannot stall a flight indefinitely or make it
     * instant. Absent or invalid means neutral conditions.
     */
    private Double weatherMultiplier;
}
