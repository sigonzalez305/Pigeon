package com.pigeon.messenger.repository;

import com.pigeon.messenger.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participantAId = :userId OR c.participantBId = :userId) " +
           "ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "(c.participantAId = :userA AND c.participantBId = :userB) OR " +
           "(c.participantAId = :userB AND c.participantBId = :userA)")
    Optional<Conversation> findByParticipants(@Param("userA") Long userA,
                                               @Param("userB") Long userB);
}
