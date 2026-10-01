# Build context: monorepo root.
FROM node:22-slim AS deps

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/app-games/package.json ./apps/app-games/

RUN pnpm --filter app-games... install --frozen-lockfile

FROM deps AS build

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY apps/app-games/ ./apps/app-games/

# Keep the asset copy valid even while the app has no public files.
RUN mkdir -p apps/app-games/public && pnpm --filter app-games build

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /build/apps/app-games/.next/standalone ./
COPY --from=build --chown=node:node /build/apps/app-games/.next/static ./apps/app-games/.next/static
COPY --from=build --chown=node:node /build/apps/app-games/public ./apps/app-games/public

USER node

EXPOSE 3000

CMD ["node", "apps/app-games/server.js"]
