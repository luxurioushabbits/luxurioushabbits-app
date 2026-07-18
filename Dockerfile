# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Increase Node memory for build
ENV NODE_OPTIONS="--max-old-space-size=4096"

# VITE_ env vars must be available at build time for Vite to inline them
ARG VITE_OAUTH_PORTAL_URL
ARG VITE_APP_ID
ARG VITE_FRONTEND_FORGE_API_KEY
ARG VITE_FRONTEND_FORGE_API_URL
ARG VITE_WALLETCONNECT_PROJECT_ID
ARG VITE_PAYPAL_CLIENT_ID
ARG VITE_CRYPTO_PAYMENTS_ENABLED
ARG VITE_APP_TITLE
ARG VITE_APP_LOGO
ARG VITE_GA4_MEASUREMENT_ID
ARG VITE_ANALYTICS_ENDPOINT
ARG VITE_ANALYTICS_WEBSITE_ID
ENV VITE_OAUTH_PORTAL_URL=$VITE_OAUTH_PORTAL_URL
ENV VITE_APP_ID=$VITE_APP_ID
ENV VITE_FRONTEND_FORGE_API_KEY=$VITE_FRONTEND_FORGE_API_KEY
ENV VITE_FRONTEND_FORGE_API_URL=$VITE_FRONTEND_FORGE_API_URL
ENV VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID
ENV VITE_CRYPTO_PAYMENTS_ENABLED=$VITE_CRYPTO_PAYMENTS_ENABLED
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_LOGO=$VITE_APP_LOGO
ENV VITE_GA4_MEASUREMENT_ID=$VITE_GA4_MEASUREMENT_ID
ENV VITE_ANALYTICS_ENDPOINT=$VITE_ANALYTICS_ENDPOINT
ENV VITE_ANALYTICS_WEBSITE_ID=$VITE_ANALYTICS_WEBSITE_ID

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
ENV NODE_OPTIONS=""

# Copy built application and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port (Railway uses PORT env var)
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
