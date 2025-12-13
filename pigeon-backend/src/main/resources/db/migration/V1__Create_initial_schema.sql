-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    active_pigeon_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pigeons Table (cosmetic/theme layer)
CREATE TABLE pigeons (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    sprite_key VARCHAR(50) NOT NULL,
    level INT DEFAULT 1,
    mood VARCHAR(20) DEFAULT 'happy',
    energy INT DEFAULT 100,
    trait VARCHAR(50),
    is_in_party BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_level CHECK (level >= 1 AND level <= 100),
    CONSTRAINT check_energy CHECK (energy >= 0 AND energy <= 100),
    CONSTRAINT check_mood CHECK (mood IN ('happy', 'neutral', 'tired', 'sad'))
);

-- Conversations Table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    participant_a_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    participant_b_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    last_message_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(participant_a_id, participant_b_id)
);

-- Messages Table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    client_nonce VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    CONSTRAINT check_status CHECK (status IN ('sending', 'sent', 'delivered', 'read'))
);

-- Message Status Table (per-recipient read receipts)
CREATE TABLE message_status (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'delivered',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id),
    CONSTRAINT check_recipient_status CHECK (status IN ('delivered', 'read'))
);

-- Flights Table (theme/cosmetic only)
CREATE TABLE flights (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
    pigeon_id BIGINT REFERENCES pigeons(id) ON DELETE SET NULL,
    depart_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    eta_at TIMESTAMP,
    state VARCHAR(20) DEFAULT 'flying',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_flight_state CHECK (state IN ('flying', 'delivered', 'returned'))
);

-- Create indexes for better performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversations_participants ON conversations(participant_a_id, participant_b_id);
CREATE INDEX idx_pigeons_user ON pigeons(user_id);
CREATE INDEX idx_message_status_message ON message_status(message_id);
CREATE INDEX idx_flights_message ON flights(message_id);

-- Add foreign key for last_message_id (must be done after messages table is created)
ALTER TABLE conversations ADD CONSTRAINT fk_conversations_last_message
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- Add foreign key for active_pigeon_id (must be done after pigeons table is created)
ALTER TABLE users ADD CONSTRAINT fk_users_active_pigeon
    FOREIGN KEY (active_pigeon_id) REFERENCES pigeons(id) ON DELETE SET NULL;
