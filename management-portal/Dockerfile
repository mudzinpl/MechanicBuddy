# MechanicBuddy Management Portal Dockerfile

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder

# Version build args
ARG VERSION=0.0.0
ARG BUILD_SHA=unknown

# Public client build args. NEXT_PUBLIC_* is inlined into the client bundle at
# build time. For the URL vars we bake unique placeholders and rewrite them to
# the real values at startup (see docker-entrypoint.sh), so they stay overridable
# at container runtime. The Stripe publishable key default targets local dev.
ARG NEXT_PUBLIC_MANAGEMENT_API_URL=https://runtime-management-api-url.invalid
ARG NEXT_PUBLIC_APP_URL=https://runtime-app-url.invalid
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy env vars for build time (actual values injected at runtime)
ENV SESSION_SECRET=build-time-placeholder-secret-32chars
ENV NEXT_PUBLIC_MANAGEMENT_API_URL=$NEXT_PUBLIC_MANAGEMENT_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_APP_VERSION=${VERSION}
ENV NEXT_PUBLIC_BUILD_SHA=${BUILD_SHA}

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner

# Version build args
ARG VERSION=0.0.0
ARG BUILD_SHA=unknown

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_VERSION=${VERSION}
ENV NEXT_PUBLIC_BUILD_SHA=${BUILD_SHA}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public folder if it exists (optional)
# COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3026

ENV PORT=3026
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
