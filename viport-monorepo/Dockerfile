# =============================================================================
# VIPORT MONOREPO - MULTI-STAGE PRODUCTION DOCKERFILE
# =============================================================================
# This Dockerfile builds the entire monorepo for production deployment

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

# Install dependencies
RUN pnpm install --frozen-lockfile

# =============================================================================
# BUILD STAGE - Build the application
# =============================================================================
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy all source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build all packages
RUN pnpm build

# =============================================================================
# PRODUCTION STAGE - Final runtime image
# =============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./apps/web/public

# Set the correct permission for the .next folder
RUN mkdir -p ./apps/web/.next
RUN chown nextjs:nodejs ./apps/web/.next

# Copy built files with correct permissions
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "apps/web/server.js"]