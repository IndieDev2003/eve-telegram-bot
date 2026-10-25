# ========================================================
# Stage 1: Build stage
# ========================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency manifests first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy application source code
COPY tsconfig.json ./
COPY agent ./agent
COPY scripts ./scripts

# Build the Eve application (Nitro server output)
RUN pnpm run build

# ========================================================
# Stage 2: Production runtime stage
# ========================================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Install ca-certificates and curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy node_modules and package configuration
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules

# Copy built application output and metadata
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/.eve ./.eve
COPY --from=builder /app/agent ./agent
COPY --from=builder /app/scripts ./scripts

# Create workflow data persistence directory and assign ownership to node user
RUN mkdir -p /app/.eve/.workflow-data && chown -R node:node /app

# Persistent volume for Eve durable workflow state
VOLUME ["/app/.eve/.workflow-data"]

# Switch to non-root user
USER node

# Expose port (default 3000)
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the Eve agent server
CMD ["pnpm", "run", "start"]
