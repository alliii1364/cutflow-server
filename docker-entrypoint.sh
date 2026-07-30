#!/bin/sh
set -e

echo "🚀 Starting CutFlow API..."

# On managed platforms (Railway, Render) the database and Redis are reached via
# full connection string URLs, not the compose sidecar hostnames — skip the nc
# checks there and let Prisma handle connectivity. Only wait when the URLs
# actually point at the docker-compose services.
case "$DATABASE_URL" in
  *@db:*)
    echo "⏳ Waiting for database..."
    until nc -z db 5432; do
      echo "Database is unavailable - sleeping"
      sleep 1
    done
    echo "✅ Database is up!"
    ;;
esac

case "$REDIS_URL" in
  *//redis:*)
    echo "⏳ Waiting for Redis..."
    until nc -z redis 6379; do
      echo "Redis is unavailable - sleeping"
      sleep 1
    done
    echo "✅ Redis is up!"
    ;;
esac

echo "🔄 Running database migrations..."
npx prisma@5.22.0 migrate deploy

echo "🔧 Ensuring Prisma client is generated..."
npx prisma@5.22.0 generate

echo "✅ Setup complete! Starting application..."
exec "$@"
