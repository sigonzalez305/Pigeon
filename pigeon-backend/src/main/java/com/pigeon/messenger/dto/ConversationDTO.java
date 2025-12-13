package com.pigeon.messenger.dto;

import com.pigeon.messenger.entity.Conversation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private List<Long> participantIds;
    private MessageDTO lastMessage;
    private Integer unreadCount;
    private LocalDateTime updatedAt;

    public static ConversationDTO fromEntity(Conversation conversation, MessageDTO lastMessage) {
        return new ConversationDTO(
            conversation.getId(),
            List.of(conversation.getParticipantAId(), conversation.getParticipantBId()),
            lastMessage,
            0, // Will be calculated
            conversation.getUpdatedAt()
        );
    }
}
