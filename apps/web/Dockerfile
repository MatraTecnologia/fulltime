# ---- deps ----
FROM node:22-slim AS deps
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /build

# Manifestos de todos os workspaces (frozen-lockfile exige workspace completo)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/config-ts/package.json ./packages/config-ts/
COPY packages/config-eslint/package.json ./packages/config-eslint/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# ---- build ----
FROM deps AS build

# NEXT_PUBLIC_* são inlined no bundle em build time — devem ser passados como
# build arg no easypanel (ex.: https://api.seudominio.com)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Pacotes do workspace necessários para compilação
COPY packages/config-ts/ ./packages/config-ts/
COPY packages/config-eslint/ ./packages/config-eslint/
COPY packages/ui/ ./packages/ui/

# Código-fonte do web
COPY apps/web/ ./apps/web/

# next build --webpack gera .next/standalone/ com server.js e node_modules mínimos
RUN pnpm --filter @fulltime/web build

# ---- runner ----
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone/ gerado pelo Next.js em monorepo:
#   .next/standalone/
#     apps/web/server.js   ← ponto de entrada
#     apps/web/.next/server/
#     node_modules/.pnpm/  ← virtual store com deps mínimas
# Copiando para /app/ resulta em /app/apps/web/server.js
COPY --from=build /build/apps/web/.next/standalone ./

# Arquivos estáticos (JS/CSS do bundle) — não incluídos no standalone
# server.js espera encontrá-los em ./apps/web/.next/static/ relativo ao WORKDIR
COPY --from=build /build/apps/web/.next/static ./apps/web/.next/static

# Arquivos públicos (favicon, logos, etc.)
COPY --from=build /build/apps/web/public ./apps/web/public

EXPOSE 3000

# Variáveis de runtime injetadas pelo easypanel (nenhuma obrigatória além de PORT)
# NEXT_PUBLIC_API_URL já está inlined no bundle — não precisa de env em runtime
CMD ["node", "apps/web/server.js"]
