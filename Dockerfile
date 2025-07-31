# Multi-stage build for Next.js frontend and Go backend

# Frontend dependencies stage
FROM node:18-alpine AS frontend-deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Frontend builder stage
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy dependencies and package files
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Copy source code
COPY src ./src
COPY public ./public

# Build the frontend application
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Backend builder stage
FROM golang:1.21-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files
COPY backend/go.mod backend/go.sum ./

# Download dependencies
RUN go mod download && go mod verify

# Copy backend source
COPY backend ./

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o bin/api \
    cmd/api/main.go

# Final production stage
FROM alpine:3.18

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata curl dumb-init && \
    update-ca-certificates

# Create non-root user for security
RUN addgroup -g 1001 -S viport && \
    adduser -S viport -u 1001 -G viport

# Set working directory
WORKDIR /app

# Copy backend binary
COPY --from=backend-builder --chown=viport:viport /app/bin/api ./api
COPY --from=backend-builder --chown=viport:viport /app/migrations ./migrations

# Copy frontend build
COPY --from=frontend-builder --chown=viport:viport /app/.next/standalone ./
COPY --from=frontend-builder --chown=viport:viport /app/.next/static ./.next/static
COPY --from=frontend-builder --chown=viport:viport /app/public ./public

# Create necessary directories and set permissions
RUN mkdir -p /app/logs /app/uploads /app/.next && \
    chown -R viport:viport /app && \
    chmod +x ./api

# Switch to non-root user
USER viport

# Expose ports
EXPOSE 3000 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || curl -f http://localhost:3000/api/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Default command - runs both frontend and backend
CMD ["sh", "-c", "./api & node server.js"]