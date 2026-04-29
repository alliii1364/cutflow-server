#!/bin/sh
set -e

echo "🚀 Starting ShowMeLive API..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 1
done
echo "✅ Database is up!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis..."
until nc -z redis 6379; do
  echo "Redis is unavailable - sleeping"
  sleep 1
done
echo "✅ Redis is up!"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client (in case it's needed)
echo "🔧 Generating Prisma client..."
npx prisma generate

# Seed database if needed (optional)
# echo "🌱 Seeding database..."
# npx prisma db seed || true

echo "✅ Setup complete! Starting application..."

# Start the application
exec "$@"
