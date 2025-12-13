package com.pigeon.messenger.dto;

import com.pigeon.messenger.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String body;
    private String clientNonce;
    private LocalDateTime createdAt;
    private String status;

    public static MessageDTO fromEntity(Message message) {
        return new MessageDTO(
            message.getId(),
            message.getConversationId(),
            message.getSenderId(),
            message.getBody(),
            message.getClientNonce(),
            message.getCreatedAt(),
            message.getStatus()
        );
    }
}
