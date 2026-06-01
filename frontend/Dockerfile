# ---------- build ----------
FROM node:22 AS build
WORKDIR /app

# Version build args
ARG VERSION=0.0.0
ARG BUILD_SHA=unknown

# API URL build args. API_URL is read at runtime (server-side proxy), so its
# default just needs to be valid for the build. NEXT_PUBLIC_* is inlined into the
# client bundle at build time; we bake a unique placeholder URL and rewrite it to
# the real value at startup (see docker-entrypoint.sh), so it stays overridable.
ARG API_URL=http://localhost:15567
ARG NEXT_PUBLIC_API_URL=https://runtime-api-url.invalid

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/. .

# Set dummy env vars for build time (actual values injected at runtime)
ENV SESSION_SECRET=build-time-placeholder-secret-32chars
ENV SERVER_SECRET=build-time-placeholder
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_VERSION=${VERSION}
ENV NEXT_PUBLIC_BUILD_SHA=${BUILD_SHA}

RUN npm run build

# ---------- runtime ----------
FROM node:22-slim
WORKDIR /app

# Version build args
ARG VERSION=0.0.0
ARG BUILD_SHA=unknown

ENV NODE_ENV=production
ENV NEXT_PUBLIC_APP_VERSION=${VERSION}
ENV NEXT_PUBLIC_BUILD_SHA=${BUILD_SHA}

COPY --from=build /app ./
RUN chmod +x ./docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm","start"]

