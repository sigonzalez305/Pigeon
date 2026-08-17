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

The demo profile seeds three accounts. Their numbers use real geographic area
codes so routes between them resolve:

- **Alice**: `+12025550111` / `password` — Washington, DC
- **Bob**: `+13055550178` / `password` — Miami, FL
- **Charlie**: `+14155550142` / `password` — San Francisco, CA

Log in as Alice and send a Pigeon Message to Bob's number to exercise the full
flow. These accounts exist only under the `demo` profile, which is never the
default.

## 🛠️ Development Setup

### Prerequisites

- **Java 17+** (for backend)
- **Node.js 18+** and npm (for frontend)
- **PostgreSQL 15+** (or use Docker)
- **Redis 7+** (or use Docker)

### Backend Setup

```bash
cd pigeon-backend

# Requires PostgreSQL and Redis. The quickest way to get both:
#   docker compose up -d postgres redis

# Run with the demo profile (seeds test accounts, enables the daily reset,
# and compresses flights into a 1-5 minute window so a send can be watched
# end to end).
SPRING_PROFILES_ACTIVE=demo ./gradlew bootRun

# Or build and run the JAR
./gradlew build
SPRING_PROFILES_ACTIVE=demo java -jar build/libs/pigeon-messenger-1.0.0.jar
```

Without a profile the app runs as `prod`, which seeds nothing and **requires
`JWT_SECRET` to be set** (at least 32 characters). It refuses to start without
one rather than falling back to a default that would be public in this
repository.

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

## ⚙️ Configuration

Nothing sensitive is committed. Every value below has a local-development
default except `JWT_SECRET`, which has none.

| Variable | Default | Notes |
|---|---|---|
| `JWT_SECRET` | *(none)* | Required in `prod`. Minimum 32 characters; the app refuses to start without it. |
| `DATABASE_URL` | `jdbc:postgresql://localhost:5432/pigeon` | |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | `postgres` / `postgres` | |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | |
| `CORS_ALLOWED_ORIGINS` | `localhost:5173,4173,3000` | **Must be set to your real domain in production**, or the browser blocks every API call. |
| `WEBSOCKET_ALLOWED_ORIGINS` | same as above | Same warning applies to the WebSocket handshake. |
| `SPRING_PROFILES_ACTIVE` | `prod` | Set to `demo` for local development. |
| `PIGEON_DAILY_LIMIT` | `1` | Pigeon Messages allowed per sender per day. |
| `PIGEON_ALLOW_DAILY_RESET` | `false` | Enables the Reset Daily Pigeon developer control. On in `demo`. |
| `PIGEON_AIRSPEED_MPH` | `55.0` | Flight duration is distance / airspeed. |
| `PIGEON_TEST_MODE` | `false` | Compresses flights into a 1-5 minute window. On in `demo`. |

## 🧪 Tests

```bash
cd pigeon-frontend && npm test        # vitest
cd pigeon-backend  && ./gradlew test  # JUnit
```

CI runs typecheck, tests, and build for both halves on every push. It also
asserts the frontend build emits its image assets and that no dev-server path
reaches the bundle — the failure mode that once shipped placeholder sprites
from a green build.

## 🕊️ How a Pigeon Message works

A Pigeon Message is two things, and the split matters:

- **The message** is ordinary, reliable messaging. `POST /api/pigeon-messages`
  writes it to the conversation before any animation runs. It is never
  contingent on the flight.
- **The flight** is theatre on top: a route, a duration derived from distance,
  and an arrival time. It decides when the ceremony says the pigeon landed. It
  never decides whether the message is delivered.

The server owns both. The client holds no message content on disk, so a flight
resumes on another device and survives clearing site data.

| Endpoint | Purpose |
|---|---|
| `POST /api/pigeon-messages` | Send. Idempotent on `clientNonce`. Enforces the daily limit. |
| `GET /api/pigeon-messages/active` | The sender's in-flight pigeon and remaining daily allowance. |
| `POST /api/pigeon-messages/{id}/arrive` | Lands a flight whose ETA has passed. |
| `POST /api/pigeon-messages/reset-daily` | Developer control; 403 unless explicitly enabled. |
