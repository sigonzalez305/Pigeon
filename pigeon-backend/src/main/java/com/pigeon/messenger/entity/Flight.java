package com.pigeon.messenger.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_id", nullable = false)
    private Long messageId;

    @Column(name = "pigeon_id")
    private Long pigeonId;

    @Column(name = "depart_at")
    private LocalDateTime departAt = LocalDateTime.now();

    @Column(name = "eta_at")
    private LocalDateTime etaAt;

    @Column(length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'flying'")
    private String state = "flying";

    @Column(name = "sender_id")
    private Long senderId;

    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;

    @Column(name = "pigeon_name", length = 50)
    private String pigeonName;

    @Column(name = "origin_lat")
    private Double originLat;

    @Column(name = "origin_lon")
    private Double originLon;

    @Column(name = "origin_region", length = 120)
    private String originRegion;

    @Column(name = "origin_source", length = 20)
    private String originSource;

    @Column(name = "destination_lat")
    private Double destinationLat;

    @Column(name = "destination_lon")
    private Double destinationLon;

    @Column(name = "destination_region", length = 120)
    private String destinationRegion;

    @Column(name = "distance_miles")
    private Double distanceMiles;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
