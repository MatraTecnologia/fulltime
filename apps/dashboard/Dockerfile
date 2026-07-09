# Build a partir da RAIZ do monorepo (mesmo contexto de build da api/app-streaming).
# O dashboard é self-contained (npm + package-lock.json próprio, fora do pnpm workspace).

# ---- deps ----
FROM node:22-slim AS deps

WORKDIR /app

COPY apps/dashboard/package.json apps/dashboard/package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:22-slim AS build

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* é embutido em tempo de build — passe a URL pública da API no easypanel (build arg).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY apps/dashboard/ ./

RUN npm run build

# ---- runner ----
FROM node:22-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Saída standalone do Next: server.js + node_modules mínimos + assets estáticos.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
