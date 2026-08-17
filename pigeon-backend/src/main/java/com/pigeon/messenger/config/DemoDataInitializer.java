package com.pigeon.messenger.config;

import com.pigeon.messenger.entity.*;
import com.pigeon.messenger.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
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

    @Autowired
    private Environment environment;

    @Override
    public void run(String... args) {
        // Belt and braces: the @Profile("demo") annotation already scopes this
        // bean, but seeding known-credential accounts into a production database
        // is bad enough to be worth a second, explicit refusal.
        if (environment.matchesProfiles("prod")) {
            System.out.println("Refusing to seed demo data while the prod profile is active.");
            return;
        }

        if (userRepository.count() > 0) {
            System.out.println("Demo data already exists. Skipping initialization.");
            return;
        }

        System.out.println("Initializing demo data...");

        // Phone numbers use real geographic NANP area codes (202 Washington DC,
        // 305 Miami, 415 San Francisco) so area-code routing resolves them. The
        // previous placeholders (+0987654321, +1112223333) had area codes
        // starting with 0 and 1, which NANP forbids and the resolver rejects,
        // making it impossible to plot a route between demo accounts.
        User alice = createUser("Alice", "+12025550111", "password");
        User bob = createUser("Bob", "+13055550178", "password");
        User charlie = createUser("Charlie", "+14155550142", "password");

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
        System.out.println("  Alice:   +1 202 555 0111 / password  (Washington, DC)");
        System.out.println("  Bob:     +1 305 555 0178 / password  (Miami, FL)");
        System.out.println("  Charlie: +1 415 555 0142 / password  (San Francisco, CA)");
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
