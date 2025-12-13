package com.pigeon.messenger.config;

import com.pigeon.messenger.entity.*;
import com.pigeon.messenger.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Profile("demo")
public class DemoDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PigeonRepository pigeonRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("Demo data already exists. Skipping initialization.");
            return;
        }

        System.out.println("Initializing demo data...");

        // Create demo users
        User alice = createUser("Alice", "+1234567890", "password");
        User bob = createUser("Bob", "+0987654321", "password");
        User charlie = createUser("Charlie", "+1112223333", "password");

        // Create demo pigeons
        Pigeon alicePigeon = createPigeon(alice, "Swift", "sprite_blue", "fast");
        Pigeon bobPigeon = createPigeon(bob, "Coo", "sprite_gray", "reliable");
        Pigeon charliePigeon = createPigeon(charlie, "Feather", "sprite_white", "gentle");

        // Set active pigeons
        alice.setActivePigeonId(alicePigeon.getId());
        bob.setActivePigeonId(bobPigeon.getId());
        charlie.setActivePigeonId(charliePigeon.getId());
        userRepository.saveAll(java.util.List.of(alice, bob, charlie));

        // Create demo conversations with messages
        createConversationWithMessages(alice, bob);
        createConversationWithMessages(alice, charlie);

        System.out.println("Demo data initialized successfully!");
        System.out.println("Test accounts:");
        System.out.println("  Alice: +1234567890 / password");
        System.out.println("  Bob:   +0987654321 / password");
        System.out.println("  Charlie: +1112223333 / password");
    }

    private User createUser(String displayName, String phone, String password) {
        User user = new User();
        user.setPhone(phone);
        user.setDisplayName(displayName);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setAvatarUrl("https://ui-avatars.com/api/?name=" + displayName);
        return userRepository.save(user);
    }

    private Pigeon createPigeon(User user, String name, String spriteKey, String trait) {
        Pigeon pigeon = new Pigeon();
        pigeon.setUserId(user.getId());
        pigeon.setName(name);
        pigeon.setSpriteKey(spriteKey);
        pigeon.setLevel(1);
        pigeon.setMood("happy");
        pigeon.setEnergy(100);
        pigeon.setTrait(trait);
        pigeon.setIsInParty(true);
        return pigeonRepository.save(pigeon);
    }

    private void createConversationWithMessages(User userA, User userB) {
        Conversation conversation = new Conversation();
        conversation.setParticipantAId(userA.getId());
        conversation.setParticipantBId(userB.getId());
        conversation = conversationRepository.save(conversation);

        // Create some demo messages
        Message msg1 = createMessage(conversation.getId(), userA.getId(),
                "Hey! How's your pigeon doing?");
        Message msg2 = createMessage(conversation.getId(), userB.getId(),
                "Great! Just reached level 2. Yours?");
        Message msg3 = createMessage(conversation.getId(), userA.getId(),
                "Awesome! Mine is getting faster every day 🕊️");

        // Update last message
        conversation.setLastMessageId(msg3.getId());
        conversationRepository.save(conversation);
    }

    private Message createMessage(Long conversationId, Long senderId, String body) {
        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setBody(body);
        message.setStatus("delivered");
        return messageRepository.save(message);
    }
}
