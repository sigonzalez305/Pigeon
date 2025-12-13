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

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
