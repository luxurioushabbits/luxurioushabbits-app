# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Increase Node memory for build
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install pnpm and production dependencies only
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Expose port (Railway uses PORT env var)
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
