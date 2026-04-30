# Multi-stage build for production
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ netcat-openbsd

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build && ls -la dist/

# Production stage
FROM node:20-alpine AS production

# Install FFmpeg and other runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    curl \
    ca-certificates \
    netcat-openbsd \
    openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma client for production
RUN npx prisma@5.22.0 generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads /app/temp && chmod 777 /app/uploads /app/temp

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/v1/health || exit 1

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]

# Start application
CMD ["node", "dist/main.js"]
