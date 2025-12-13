package com.pigeon.messenger.controller;

import com.pigeon.messenger.dto.*;
import com.pigeon.messenger.entity.*;
import com.pigeon.messenger.repository.*;
import com.pigeon.messenger.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        List<Conversation> conversations = conversationRepository.findByUserId(userId);

        List<ConversationDTO> conversationDTOs = conversations.stream()
                .map(conv -> {
                    MessageDTO lastMessage = null;
                    if (conv.getLastMessageId() != null) {
                        Message msg = messageRepository.findById(conv.getLastMessageId()).orElse(null);
                        if (msg != null) {
                            lastMessage = MessageDTO.fromEntity(msg);
                        }
                    }
                    return ConversationDTO.fromEntity(conv, lastMessage);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(conversationDTOs);
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        List<MessageDTO> messageDTOs = messages.stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(messageDTOs);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long conversationId,
            @RequestBody SendMessageRequest request,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        // Create message
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(userId);
        message.setBody(request.getBody());
        message.setClientNonce(request.getClientNonce());
        message.setStatus("sent");

        message = messageRepository.save(message);

        // Update conversation's last message
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conversation.setLastMessageId(message.getId());
        conversationRepository.save(conversation);

        MessageDTO messageDTO = MessageDTO.fromEntity(message);

        // Broadcast via WebSocket
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/conversations/" + conversationId, messageDTO);
        }

        return ResponseEntity.ok(messageDTO);
    }

    @PostMapping("/create")
    public ResponseEntity<ConversationDTO> createConversation(
            @RequestParam Long otherUserId,
            @RequestHeader("Authorization") String authHeader) {

        Long userId = jwtUtil.extractUserId(authHeader.substring(7));

        // Check if conversation already exists
        var existing = conversationRepository.findByParticipants(userId, otherUserId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(ConversationDTO.fromEntity(existing.get(), null));
        }

        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setParticipantAId(userId);
        conversation.setParticipantBId(otherUserId);
        conversation = conversationRepository.save(conversation);

        return ResponseEntity.ok(ConversationDTO.fromEntity(conversation, null));
    }
}
