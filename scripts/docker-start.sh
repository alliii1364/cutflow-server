#!/bin/bash
# Start script for Docker environment

set -e

echo "🚀 ShowMeLive Docker Starter"
echo "============================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration."
fi

# Parse arguments
MODE=${1:-all}

if [ "$MODE" = "dev" ]; then
    echo "🔧 Starting development mode (DB + Redis only)..."
    docker-compose -f docker-compose.dev.yml up -d
    
    echo ""
    echo "✅ Services started!"
    echo ""
    echo "Database:  postgres://postgres:postgres@localhost:5432/cutflow"
    echo "Redis:     redis://localhost:6379"
    echo "PgAdmin:   http://localhost:5050"
    echo ""
    echo "Run API locally:"
    echo "  npm run start:dev"
    
elif [ "$MODE" = "full" ]; then
    echo "🐳 Starting full stack with API container..."
    docker-compose up -d
    
    echo ""
    echo "⏳ Waiting for services to be healthy..."
    sleep 5
    
    # Check health
    if curl -s http://localhost:3000/health > /dev/null; then
        echo ""
        echo "✅ All services are running!"
        echo ""
        echo "API:       http://localhost:3000"
        echo "Docs:      http://localhost:3000/api/docs"
        echo "PgAdmin:   http://localhost:5050"
        echo "Redis:     redis://localhost:6379"
    else
        echo "⚠️  API might still be starting... Check logs:"
        echo "  docker-compose logs -f api"
    fi
    
elif [ "$MODE" = "stop" ]; then
    echo "🛑 Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    echo "✅ All services stopped."
    
elif [ "$MODE" = "clean" ]; then
    echo "🧹 Cleaning up (removes all data)..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
    echo "✅ All services and volumes removed."
    
else
    echo "Usage: ./scripts/docker-start.sh [dev|full|stop|clean]"
    echo ""
    echo "Commands:"
    echo "  dev   - Start only DB and Redis (for local development)"
    echo "  full  - Start entire stack including API container"
    echo "  stop  - Stop all running services"
    echo "  clean - Stop and remove all data (WARNING: deletes database)"
    exit 1
fi
