# Breakdex Expo Dockerfile
# Multi-stage build for development

# Stage 1: Base image with Node.js
FROM node:20-alpine AS deps

WORKDIR /app

# Install native dependencies for Expo
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    openssl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM deps AS builder

# Copy source files
COPY . .

# Build the app
RUN npm run typecheck

# Stage 3: Runtime
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files and source
COPY --from=builder /app .

# Expo needs these ports
EXPOSE 19000 19001 19002

# Set environment variables
ENV NODE_ENV=production
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:19000/health || exit 1

# Start the Expo dev server
CMD ["expo", "start", "--clear", "--host=0.0.0.0"]
