# ShowMeLive Backend API

A complete NestJS (Node.js/TypeScript) backend for the AI Video Creation Platform.

## Features

### Core Modules
- **Auth**: JWT authentication, Google OAuth2, refresh tokens, password reset
- **Users**: Profile management, avatar upload, usage stats
- **Subscriptions**: Stripe integration, plan management, billing portal
- **Media**: S3 upload, B-roll management, Google Drive integration
- **Videos**: Project CRUD, lifecycle management (draft/processing/ready/exported)

### AI-Powered Modules
- **AI Editing**: Silence removal, aspect ratio resize, filters, zoom effects (FFmpeg)
- **Captions**: Whisper STT, caption editing, keyword highlighting, animated captions
- **Scripts**: GPT-4o script generation, hook variations, tone selection
- **Music**: AI music generation, mood detection, beat-sync
- **Voice & Avatar**: ElevenLabs voices, AI avatar presenter
- **Visual AI**: Background removal/replace, watermark removal, similarity engine

### Platform Features
- **Export**: Multi-resolution rendering (720p/1080p/4K), platform presets, S3 delivery
- **Templates**: Canva-style template library, creative assets, user saved templates
- **Split Testing**: A/B test video variants
- **Admin**: User management, subscription monitoring, feature flags
- **Analytics**: User dashboards, feature tracking, platform metrics
- **Notifications**: Email (SendGrid), in-app notifications
- **Extras**: Brand Kit, project versioning, webhooks, referrals, SEO metadata

## Tech Stack

- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport
- **Payments**: Stripe
- **File Storage**: AWS S3
- **Job Queue**: BullMQ with Redis
- **AI Services**:
  - OpenAI (GPT-4o, Whisper) - scripts, captions
  - ElevenLabs - voice generation
  - Replicate - visual AI
- **Email**: SendGrid

## Project Structure

```
src/
├── auth/               # JWT, OAuth, refresh tokens
├── users/              # User CRUD, profiles, usage tracking
├── subscriptions/      # Stripe plans, webhooks, usage gates
├── media/              # S3 upload, multipart, B-roll
├── videos/             # Video projects CRUD + status
├── ai-editing/         # Silence removal, resize, filters, reframe
├── captions/           # Whisper STT, caption styles, keywords
├── scripts/            # AI script + hook generation
├── split-testing/      # Video variants, A/B test sessions
├── music/              # AI music gen, mood matching, beat sync
├── voice-avatar/       # ElevenLabs voices, avatar presenter
├── visual-ai/          # BG removal, watermark, similarity engine
├── export/             # Render pipeline, format conversion
├── templates/          # Template + asset library
├── admin/              # Admin dashboard APIs
├── analytics/          # Usage metrics, feature tracking
├── notifications/      # Email (SendGrid), in-app alerts
├── extras/             # Brand Kit, versioning, webhooks, referrals
├── queue/              # BullMQ service
├── storage/            # S3 service abstraction
├── prisma/             # Prisma service + schema
└── common/             # Guards, decorators, filters
```

## 🚀 Quick Start (Docker - Recommended)

The easiest way to get started is using Docker, which includes PostgreSQL, Redis, and FFmpeg pre-configured.

### Option 1: Full Stack (Everything in Docker)

```bash
# Start all services (API + DB + Redis)
docker-compose up -d

# Or use the helper script
./scripts/docker-start.sh full     # Linux/Mac
.\scripts\docker-start.ps1 full      # Windows PowerShell
```

### Option 2: Development Mode (DB + Redis in Docker, API locally)

```bash
# Start only database services
docker-compose -f docker-compose.dev.yml up -d

# Or use the helper script
./scripts/docker-start.sh dev        # Linux/Mac
.\scripts\docker-start.ps1 dev      # Windows PowerShell

# Then run API locally
npm run start:dev
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| API Docs | http://localhost:3000/api/docs | - |
| PgAdmin | http://localhost:5050 | admin@cutflow.app / admin |
| Redis Insight | http://localhost:5540 | - |

See [DOCKER.md](DOCKER.md) for detailed Docker instructions.

---

## 🛠️ Manual Installation (Without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- FFmpeg (for video processing)

### Installation Steps

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run start:dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/cutflow?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="cutflow-media"

# OpenAI
OPENAI_API_KEY="sk-..."

# SendGrid
SENDGRID_API_KEY="SG."
SENDGRID_FROM_EMAIL="noreply@cutflow.app"

# Server
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

## API Documentation

Once the server is running, Swagger documentation is available at:
```
http://localhost:3000/api/docs
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/google` - Google OAuth
- `POST /auth/forgot-password` - Request password reset

#### Videos
- `POST /videos` - Create project
- `GET /videos` - List user projects
- `GET /videos/:id` - Get project details
- `PATCH /videos/:id` - Update project
- `DELETE /videos/:id` - Delete project

#### AI Features
- `POST /ai-editing/:projectId/silence-removal` - Remove silence
- `POST /captions/:projectId/generate` - Generate captions
- `POST /scripts/:projectId/generate` - Generate script
- `POST /music/:projectId/generate` - Generate music
- `POST /voice-avatar/:projectId/voice` - Generate voiceover

#### Export
- `POST /export/:projectId` - Queue export
- `GET /export/:exportId/status` - Check status
- `GET /export/:exportId/download` - Get download URL

#### Subscriptions
- `GET /subscriptions/plans` - List plans
- `POST /subscriptions/checkout` - Create checkout session
- `POST /subscriptions/portal` - Billing portal

## Database Schema

The Prisma schema includes 25+ models:
- User, Subscription, Plan
- VideoProject, VideoExport, MediaFile
- Caption, AIScript, MusicTrack, VoiceTrack
- Template, CreativeAsset, UserTemplate
- AnalyticsEvent, Notification, Webhook
- And more...

See `prisma/schema.prisma` for complete schema definition.

## Job Queues

Heavy processing tasks are queued via BullMQ:

| Queue | Jobs |
|-------|------|
| ai-editing | silence_removal, resize, filters, zoom_effects |
| captions | generate (Whisper STT) |
| music | generate, beat_detection |
| voice | generate |
| avatar | generate |
| visual-ai | bg_removal, watermark_removal, similarity |
| export | render, render-variant |
| extras | thumbnail |

## 🐳 Docker Deployment

Build and push Docker image:

```bash
# Build image
docker build -t cutflow-api:latest .

# Tag for registry
docker tag cutflow-api:latest your-registry/cutflow-api:latest

# Push
docker push your-registry/cutflow-api:latest
```

### Supported Platforms
- **Railway.app**: `railway up`
- **Fly.io**: `fly deploy`
- **Render.com**: Connect GitHub repo
- **AWS ECS**: Use built image
- **DigitalOcean App Platform**: Use built image

See [DOCKER.md](DOCKER.md) for platform-specific deployment guides.

## License

UNLICENSED
