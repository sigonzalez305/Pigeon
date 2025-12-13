package com.pigeon.messenger.controller;

import com.pigeon.messenger.dto.PigeonDTO;
import com.pigeon.messenger.entity.Pigeon;
import com.pigeon.messenger.entity.User;
import com.pigeon.messenger.repository.PigeonRepository;
import com.pigeon.messenger.repository.UserRepository;
import com.pigeon.messenger.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pigeons")
public class PigeonController {

    @Autowired
    private PigeonRepository pigeonRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/party")
    public ResponseEntity<List<PigeonDTO>> getParty(@RequestHeader("Authorization") String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        List<Pigeon> pigeons = pigeonRepository.findByUserIdAndIsInPartyTrue(userId);

        List<PigeonDTO> pigeonDTOs = pigeons.stream()
                .map(PigeonDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(pigeonDTOs);
    }

    @PutMapping("/{pigeonId}/activate")
    public ResponseEntity<PigeonDTO> setActivePigeon(
            @PathVariable Long pigeonId,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        Pigeon pigeon = pigeonRepository.findById(pigeonId)
                .orElseThrow(() -> new RuntimeException("Pigeon not found"));

        if (!pigeon.getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActivePigeonId(pigeonId);
        userRepository.save(user);

        return ResponseEntity.ok(PigeonDTO.fromEntity(pigeon));
    }
}
