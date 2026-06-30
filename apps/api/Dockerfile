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

# Placeholder para o prisma.config.ts (generate não precisa do banco, mas a função
# env() pode falhar se DATABASE_URL não existir ao carregar o config)
ENV DATABASE_URL=postgresql://placeholder/placeholder

# Arquivos de configuração do TypeScript (referenciados via workspace:*)
COPY packages/config-ts/ ./packages/config-ts/

# Código-fonte da API
COPY apps/api/ ./apps/api/

# Gera o Prisma Client dentro do virtual store do pnpm (apps/api/node_modules não
# existe; o client aterra em node_modules/.pnpm/@prisma+client@.../node_modules/@prisma/client/)
RUN pnpm --filter @fulltime/api db:generate

# Compila TypeScript → apps/api/dist/
RUN pnpm --filter @fulltime/api build && ls -R ./apps/api

# Garante que public/ exista para o fastifyStatic não falhar na inicialização
RUN mkdir -p ./apps/api/public

# Cria bundle de produção com deps sem devDependencies.
# pnpm deploy copia do virtual store (com o Prisma Client já gerado) para um
# node_modules flat em /app/deploy — sem precisar de COPY extra do .prisma/
RUN pnpm --filter @fulltime/api deploy --legacy /app/deploy

# ---- runner ----
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# node_modules de produção (flat, via pnpm deploy)
# Inclui @prisma/client com generator-build/ já gerado no stage anterior
COPY --from=build /app/deploy/node_modules ./node_modules

# Código compilado (dist/server.js chama join(__dirname, '..', 'public') → /app/public)
COPY --from=build /build/apps/api/dist ./dist

# Schema do Prisma (referência para operações de db push em manutenção)
COPY --from=build /build/apps/api/prisma ./prisma

# Arquivos estáticos servidos em /static/ pelo fastifyStatic
COPY --from=build /build/apps/api/public ./public

EXPOSE 3333

# Variáveis injetadas pelo easypanel em runtime:
# DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, FRONTEND_URL,
# RESEND_API_KEY, MAIL_FROM, COOKIE_DOMAIN, PORT (opcional, default 3333)
CMD ["node", "dist/server.js"]
