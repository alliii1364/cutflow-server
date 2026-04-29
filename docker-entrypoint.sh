#!/bin/sh
set -e

echo "🚀 Starting CutFlow API..."

# On Render the database and Redis are reached via full connection string URLs,
# not bare hostnames — skip nc checks and let Prisma handle connectivity.
if [ -z "$RENDER" ]; then
  # Local Docker Compose: wait for sidecar services by hostname
  echo "⏳ Waiting for database..."
  until nc -z db 5432; do
    echo "Database is unavailable - sleeping"
    sleep 1
  done
  echo "✅ Database is up!"

  echo "⏳ Waiting for Redis..."
  until nc -z redis 6379; do
    echo "Redis is unavailable - sleeping"
    sleep 1
  done
  echo "✅ Redis is up!"
fi

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🔧 Ensuring Prisma client is generated..."
npx prisma generate

echo "✅ Setup complete! Starting application..."
exec "$@"
