# 🕊️ Pigeon Messenger

A modern messaging web app with a Pokémon-inspired overworld aesthetic and Meta-quality UX. Features a unique "Coop Town" home screen, standard messaging inbox/threads, and a "pigeon flight" theme layer on top of instant messaging infrastructure.

## 🎮 Features

- **Pokémon-Inspired Aesthetic**: Overworld home screen with interactive elements
- **Instant Messaging**: Real-time messaging with WebSocket support
- **Pigeon Companions**: Customizable pigeon party system with Tamagotchi-style elements
- **Meta-Quality UX**: Familiar inbox/thread patterns with optimistic UI
- **Flight Animations**: Delightful cosmetic animations after sending messages
- **Demo Mode**: Pre-seeded demo data for instant testing

## 🏗️ Architecture

### Backend (Spring Boot)
- **Spring Boot 3.2+** with Java 17
- **Spring Security** with JWT authentication
- **Spring WebSocket** for real-time messaging
- **PostgreSQL** database
- **Redis** for caching and pub/sub
- **Flyway** for database migrations

### Frontend (React + TypeScript)
- **React 18** with **TypeScript**
- **Vite** build tool
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Router** for navigation
- **STOMP/SockJS** for WebSocket

## 🚀 Quick Start with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# Wait for services to start (about 30 seconds)
# Frontend will be available at http://localhost:3000
# Backend API at http://localhost:8080
```

### Demo Accounts

The application comes with pre-seeded demo data:

- **Alice**: `+1234567890` / `password`
- **Bob**: `+0987654321` / `password`
- **Charlie**: `+1112223333` / `password`

Login with any of these accounts to see existing conversations and pigeons.

## 🛠️ Development Setup

### Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** and npm (for frontend)
- **PostgreSQL 15+** (or use Docker)
- **Redis 7+** (or use Docker)

### Backend Setup

```bash
cd pigeon-backend

# Run with Gradle (requires PostgreSQL and Redis running)
./gradlew bootRun

# Or build JAR
./gradlew build
java -jar build/libs/*.jar
```

**Backend runs on**: `http://localhost:8080`

### Frontend Setup

```bash
cd pigeon-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

## 📦 Project Structure

```
Pigeon/
├── pigeon-backend/               # Spring Boot backend
│   ├── src/main/java/com/pigeon/messenger/
│   │   ├── entity/              # JPA entities
│   │   ├── repository/          # Data repositories
│   │   ├── controller/          # REST controllers
│   │   ├── dto/                 # Data transfer objects
│   │   ├── security/            # JWT authentication
│   │   └── config/              # Configuration classes
│   ├── src/main/resources/
│   │   ├── db/migration/        # Flyway migrations
│   │   └── application.properties
│   ├── build.gradle
│   └── Dockerfile
│
├── pigeon-frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── store/               # Zustand stores
│   │   ├── services/            # API and WebSocket services
│   │   └── styles/              # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
└── docker-compose.yml            # Docker Compose configuration
```

## 🎨 Design System

The app uses a dark, neon-accented design inspired by Pokémon games:

### Color Palette
- **Dark Base**: `#0a0a0f`, `#131318`, `#1a1a24`
- **Neon Accents**: Cyan `#00f0ff`, Pink `#ff00ff`, Yellow `#ffff00`
- **UI Elements**: Panel `#2a2a3a`, Border `#3a3a4a`

### Typography
- **Headings**: "Press Start 2P" (pixel font)
- **Body**: "Inter" (modern sans-serif)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Conversations
- `GET /api/conversations` - Get user's conversations
- `GET /api/conversations/{id}/messages` - Get conversation messages
- `POST /api/conversations/{id}/messages` - Send a message
- `POST /api/conversations/create` - Create new conversation

### Pigeons
- `GET /api/pigeons/party` - Get user's pigeon party
- `PUT /api/pigeons/{id}/activate` - Set active pigeon

### WebSocket
- Connect: `/ws` (SockJS endpoint)
- Subscribe: `/topic/conversations/{id}` - Real-time messages

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Authentication**: Register and login work
- [ ] **WebSocket**: Real-time message delivery
- [ ] **Optimistic UI**: Messages appear instantly
- [ ] **Pigeon Selection**: Can choose active pigeon
- [ ] **Flight Animation**: Plays after sending
- [ ] **Inbox**: Shows conversations with previews
- [ ] **Thread View**: Messages display correctly

## 🔧 Troubleshooting

### Backend Issues

**Database connection failed**:
- Ensure PostgreSQL is running
- Check connection string in `application.properties`

**Flyway migration errors**:
- Drop and recreate database: `DROP DATABASE pigeon; CREATE DATABASE pigeon;`

### Frontend Issues

**WebSocket not connecting**:
- Check backend is running on port 8080
- Verify CORS settings in backend

**Build errors**:
- Delete `node_modules` and run `npm install` again

### Docker Issues

```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose down
docker-compose up -d
```

## 🛣️ Roadmap

Future enhancements:

- [ ] Voice notes with pigeon sound effects
- [ ] Pigeon leveling system
- [ ] Achievements and badges
- [ ] Group conversations
- [ ] Offline mode with message queue
- [ ] Push notifications
- [ ] Media attachments

## 📄 License

See LICENSE file for details.

---

Made with ❤️ and 🕊️
