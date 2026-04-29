# Docker Setup Guide

This guide explains how to run the ShowMeLive backend using Docker with all dependencies (PostgreSQL, Redis, FFmpeg) included.

## 🐳 What's Included

- **API Container**: NestJS app with FFmpeg pre-installed
- **PostgreSQL**: Database for all application data
- **Redis**: Cache and BullMQ job queue
- **PgAdmin** (optional): Web GUI for PostgreSQL
- **Redis Insight** (optional): Web GUI for Redis

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose (comes with Docker Desktop)
- At least 4GB RAM available for Docker

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Make sure these point to Docker services:
# DATABASE_URL="postgresql://postgres:postgres@db:5432/cutflow?schema=public"
# REDIS_URL="redis://redis:6379"
```

### 2. Start All Services

```bash
# Build and start everything
docker-compose up -d

# Or with logs visible
docker-compose up
```

### 3. Check Status

```bash
# See running containers
docker-compose ps

# View logs
docker-compose logs -f api

# Health check
curl http://localhost:3000/health
```

### 4. Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| API Docs | http://localhost:3000/api/docs | - |
| PgAdmin | http://localhost:5050 | admin@cutflow.app / admin |
| Redis Insight | http://localhost:5540 | - |

## 🛠️ Development Mode

For local development (only external services, run API locally):

```bash
# Start only DB and Redis
docker-compose -f docker-compose.dev.yml up -d

# Run API locally (in another terminal)
npm run start:dev
```

## 📋 Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (DELETES ALL DATA)
docker-compose down -v

# Rebuild containers after code changes
docker-compose up -d --build

# View specific service logs
docker-compose logs -f db
docker-compose logs -f redis
docker-compose logs -f api

# Execute commands in containers
docker-compose exec api sh
docker-compose exec db psql -U postgres -d cutflow
docker-compose exec redis redis-cli

# Database migrations (if needed manually)
docker-compose exec api npx prisma migrate deploy

# Generate Prisma client
docker-compose exec api npx prisma generate
```

## 🔧 Production Deployment

### Railway.app Deployment

1. Push code to GitHub
2. Connect Railway to your repo
3. Add PostgreSQL and Redis plugins
4. Set environment variables
5. Deploy!

```bash
# Railway CLI install
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Fly.io Deployment

```bash
# Install flyctl
winget install FlyIo.flyctl  # Windows
brew install flyctl           # MacOS

# Launch app
fly launch

# Create postgres
fly postgres create

# Create redis
fly redis create

# Deploy
fly deploy
```

### AWS ECS / DigitalOcean App Platform

Build and push image:

```bash
# Build production image
docker build -t cutflow-api:latest .

# Tag for registry
docker tag cutflow-api:latest your-registry/cutflow-api:latest

# Push
docker push your-registry/cutflow-api:latest
```

## 🔍 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Database not ready - wait a few seconds
# 2. Missing env vars - check .env file
# 3. Port conflicts - change ports in docker-compose.yml
```

### Database connection issues

```bash
# Reset database (DELETES ALL DATA)
docker-compose down -v
docker-compose up -d db

# Wait for DB to be healthy, then:
docker-compose up -d api
```

### FFmpeg not working

FFmpeg is pre-installed in the container. Test it:

```bash
docker-compose exec api ffmpeg -version
```

### Redis connection issues

```bash
# Test Redis
docker-compose exec redis redis-cli ping
# Should return: PONG
```

## 📊 Resource Requirements

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| API | 0.5 | 512MB | - |
| PostgreSQL | 0.5 | 512MB | 10GB |
| Redis | 0.25 | 256MB | 1GB |
| **Total** | **1.25** | **1.25GB** | **11GB** |

## 🔐 Security Notes

- Change default passwords in production
- Use strong JWT secrets
- Enable SSL/TLS for production
- Don't expose PgAdmin/Redis Insight in production
- Use AWS S3 for file storage (not local volumes)

## 📝 Environment Variables for Docker

These are automatically set in docker-compose.yml, override in .env if needed:

```env
# Database (internal Docker network)
DATABASE_URL=postgresql://postgres:postgres@db:5432/cutflow?schema=public

# Redis (internal Docker network)
REDIS_URL=redis://redis:6379

# All other env vars from .env.example
# Copy your actual API keys, secrets etc.
```

## 🆘 Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify env vars: `docker-compose exec api env`
3. Test connections: `docker-compose exec api nc -zv db 5432`
