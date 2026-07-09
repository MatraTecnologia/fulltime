# ---- deps ----
FROM node:22-slim AS deps

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/app-streaming/package.json ./apps/app-streaming/
COPY packages/config-ts/package.json ./packages/config-ts/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ---- build ----
FROM deps AS build

COPY packages/config-ts/ ./packages/config-ts/
COPY packages/ui/ ./packages/ui/
COPY apps/app-streaming/ ./apps/app-streaming/

RUN pnpm --filter app-streaming build

# Cria um node_modules de produção sem symlinks quebrados
RUN pnpm --filter app-streaming deploy --legacy /app/deploy

# ---- runner ----
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

# Dependências de produção
COPY --from=build /app/deploy/node_modules ./node_modules

# Build SSR standalone (server + client)
COPY --from=build /build/apps/app-streaming/dist ./dist

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
