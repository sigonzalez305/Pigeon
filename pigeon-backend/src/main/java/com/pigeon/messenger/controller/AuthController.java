package com.pigeon.messenger.controller;

import com.pigeon.messenger.dto.*;
import com.pigeon.messenger.entity.User;
import com.pigeon.messenger.repository.UserRepository;
import com.pigeon.messenger.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            return ResponseEntity.badRequest().body("Phone number already registered");
        }

        // Create new user
        User user = new User();
        user.setPhone(request.getPhone());
        user.setDisplayName(request.getDisplayName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getPhone(), user.getId());

        return ResponseEntity.ok(new AuthResponse(token, UserDTO.fromEntity(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByPhone(request.getPhone())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getPhone(), user.getId());

        return ResponseEntity.ok(new AuthResponse(token, UserDTO.fromEntity(user)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long userId = jwtUtil.extractUserId(token);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
