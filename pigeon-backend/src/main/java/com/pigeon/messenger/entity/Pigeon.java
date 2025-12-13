package com.pigeon.messenger.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "pigeons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Pigeon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "sprite_key", nullable = false, length = 50)
    private String spriteKey;

    @Column(columnDefinition = "INT DEFAULT 1")
    private Integer level = 1;

    @Column(length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'happy'")
    private String mood = "happy";

    @Column(columnDefinition = "INT DEFAULT 100")
    private Integer energy = 100;

    @Column(length = 50)
    private String trait;

    @Column(name = "is_in_party", columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean isInParty = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
