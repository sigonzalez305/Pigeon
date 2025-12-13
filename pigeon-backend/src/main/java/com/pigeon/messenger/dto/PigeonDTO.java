package com.pigeon.messenger.dto;

import com.pigeon.messenger.entity.Pigeon;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PigeonDTO {
    private Long id;
    private String name;
    private String spriteKey;
    private Integer level;
    private String mood;
    private Integer energy;
    private String trait;

    public static PigeonDTO fromEntity(Pigeon pigeon) {
        return new PigeonDTO(
            pigeon.getId(),
            pigeon.getName(),
            pigeon.getSpriteKey(),
            pigeon.getLevel(),
            pigeon.getMood(),
            pigeon.getEnergy(),
            pigeon.getTrait()
        );
    }
}
