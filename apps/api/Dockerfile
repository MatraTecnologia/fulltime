# ---- deps ----
FROM node:22-slim AS deps

RUN apt-get update && apt-get install -y openssl
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

WORKDIR /build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/config-ts/package.json ./packages/config-ts/
COPY packages/config-eslint/package.json ./packages/config-eslint/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ---- build ----
FROM deps AS build

ENV DATABASE_URL=postgresql://placeholder/placeholder

COPY packages/config-ts/ ./packages/config-ts/
COPY apps/api/ ./apps/api/

RUN pnpm --filter @fulltime/api db:generate
RUN pnpm --filter @fulltime/api build
RUN mkdir -p ./apps/api/public

# ---- runner ----
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl

WORKDIR /app
ENV NODE_ENV=production

# Copia o node_modules completo para preservar o Prisma Client gerado
COPY --from=build /build/node_modules ./node_modules

# Código compilado
COPY --from=build /build/apps/api/dist ./dist

# Prisma schema
COPY --from=build /build/apps/api/prisma ./prisma

# Arquivos estáticos
COPY --from=build /build/apps/api/public ./public

EXPOSE 3333

CMD ["node", "dist/server.js"]