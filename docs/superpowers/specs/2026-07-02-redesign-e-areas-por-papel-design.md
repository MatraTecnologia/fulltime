# Redesign completo + áreas por papel (Full Time)

## Objetivo

Elevar a identidade visual de toda a plataforma e estruturar três experiências por papel:

1. **Profissional** — dashboard de conclusão de cursos, certificados, crianças e perfil (premium, "Udemy").
2. **Dono/Admin** — painel de visão geral do negócio + gestão de cursos + gestão de usuários (premium, denso).
3. **Criança / Responsável** — dashboard de acompanhamento acessível por link tokenizado, sem login (lúdica, "Netflix Kids").

Tudo entregue como **um plano coeso**, organizado em fases por dependência.

## Decisões travadas (brainstorming)

- Escopo: um único plano cobrindo redesign + novas rotas + área da criança.
- Dono = papel `admin` existente com painel próprio. **Sem novo role no banco.** Instrutor gerencia apenas os próprios cursos; admin vê tudo.
- Acesso da criança: **link/token compartilhável**, sem login.
- Conteúdo da área da criança: **dois modos com controle do profissional** — `CRIANCA` (lúdico) ou `RESPONSAVEL` (registros completos), definido no token.
- Tom visual: **área da criança lúdica**, **profissional/admin premium e sóbrio**.
- Métricas do dono: **deriváveis** (sem dado de pagamento no sistema) + **card de receita "em breve"** como placeholder.
- **Light-only em tudo** — remover dark mode; identidade de base branca com as cores da logo.

## Estado atual (levantado no código)

- **Stack:** monorepo turbo. `apps/web` (Next 16 App Router, React 19, Tailwind 4, base-ui/shadcn, recharts, better-auth, Mux). `apps/api` (Fastify 5, Prisma 7, better-auth, Resend). Design system em `packages/ui` (`@fulltime/ui`).
- **Papéis:** `admin | instrutor | profissional` (campo `User.role`, default `profissional`).
- **Rotas web existentes:** `(auth)`, `(public)/cursos`, `(app)` [dashboard, catalogo, aprender/[slug], certificados, criancas, criancas/[id], perfil], `(admin)/admin` [cursos/*, debug/email].
- **API existente:** rotas `auth, children, courses, debug, enrollments, health, lessons, modules, users`. Auth por `requireAuth` + `requireRole(...roles)` (`apps/api/src/lib/session.ts`). Autoload de rotas por diretório.
- **Lacunas confirmadas:**
  - Sem modelo de pagamento/receita.
  - `User` sem flag de ativo/banido.
  - Sem modelo de link/token compartilhável.
  - `/users` só expõe `/users/me`.
  - `(admin)` só administra cursos; sem painel de dono nem gestão de usuários.
  - Sem login/acesso de criança.

## Cores da marca (extraídas de `logo.svg`)

| Papel | Hex |
|---|---|
| Navy (estrutura/texto) | `#032E5B` |
| Amber (destaque primário) | `#FDB509` |
| Verde | `#6BA93C` |
| Azul | `#0D92E1` |
| Roxo | `#8649A5` |
| Branco (base) | `#FDFCFF` |

---

## Arquitetura

### Frente 1 — Fundação de design (bloqueia todo o resto)

Reformular `packages/ui/src/styles/theme.css` e `apps/web/src/app/globals.css`:

- **Base branca predominante**, muito respiro (espaçamento generoso), navy como texto/estrutura.
- Consolidar tokens: remover o bloco `.dark` e simplificar variáveis para light-only.
- Definir os 4 acentos como tokens semânticos de categoria/mundo (`--color-brand-amber/green/blue/purple`) + mapeamento para gráficos recharts.
- Tipografia: Nunito (display) + Inter (texto), com escala tipográfica revisada.
- Elevar primitivos em `packages/ui/src/components`: `Card`, `Button`, `ProgressBar`, `Badge`, além de novos: `StatCard` (métrica com ícone/tendência) e wrappers de gráfico consistentes.
- Nada de dark: garantir contraste AA na base clara.

**Interface:** os primitivos exportados por `@fulltime/ui` não mudam de assinatura pública sem necessidade; mudanças são visuais/token. Consumidores (web) não quebram.

### Frente 2 — Backend (rotas e schema)

Mudanças em `apps/api/prisma/schema.prisma`:

- `User`: adicionar `active Boolean @default(true)`.
- Novo enum `ShareMode { CRIANCA RESPONSAVEL }`.
- Novo modelo:

```prisma
model ChildShareLink {
  id          String    @id @default(cuid())
  token       String    @unique
  childId     String
  mode        ShareMode
  expiresAt   DateTime
  revokedAt   DateTime?
  createdById String
  createdAt   DateTime  @default(now())
  child       Child     @relation(fields: [childId], references: [id], onDelete: Cascade)
  createdBy   User      @relation(fields: [createdById], references: [id])
  @@index([childId])
  @@map("child_share_links")
}
```

Novas rotas (seguindo o padrão `requireAuth` + `requireRole`):

- **`apps/api/src/routes/admin/index.ts`** (`requireRole('admin')`):
  - `GET /admin/metrics` — agrega counts deriváveis: total de usuários por papel, cursos publicados/rascunho, matrículas ativas/concluídas, crianças cadastradas, séries temporais simples (matrículas/conclusões por período). Sem receita.
- **Estender `apps/api/src/routes/users/index.ts`** (`requireRole('admin')` nos novos endpoints):
  - `GET /users` — listar com busca/filtro por papel + paginação.
  - `GET /users/:id` — detalhe (cursos como instrutor, crianças vinculadas, contagens).
  - `PATCH /users/:id` — mudar `role` e `active`.
- **`apps/api/src/routes/children/index.ts`** (estender, `requireAuth` + ownership):
  - `POST /children/:id/share-links` — cria link (recebe `mode`, `expiresInDays`); só o dono da criança.
  - `GET /children/:id/share-links` — lista links da criança.
  - `DELETE /share-links/:id` — revoga (seta `revokedAt`).
- **`apps/api/src/routes/acompanhamento/index.ts`** (PÚBLICO, sem `requireAuth`):
  - `GET /acompanhamento/:token` — valida token (existe, não revogado, não expirado), retorna payload conforme `mode`:
    - `RESPONSAVEL`: dados da criança + todos os registros (EVOLUCAO/SESSAO/PEI) legíveis.
    - `CRIANCA`: **apenas** camada lúdica derivada — conquistas/marcos a partir de EVOLUCAO, progresso; **nunca** conteúdo cru de PEI/SESSAO.
    - Validação 100% server-side; 404/410 para token inválido/expirado/revogado.

**Segurança/LGPD:** o token é a única superfície pública e expõe dados de menores. Regras não-negociáveis: expiração obrigatória, revogação disponível ao profissional, filtragem por modo no servidor (a criança nunca recebe registro clínico), token aleatório de alta entropia.

### Frente 3 — Áreas premium redesenhadas

**Profissional `(app)`** — mantém rotas, redesenha telas com a nova fundação:
- `/dashboard`: hero de saudação, StatCards (em andamento/concluídos/aulas), "continuar de onde parou", grade de cursos, atalho para crianças e certificados.
- `/catalogo`, `/aprender/[slug]`, `/certificados`, `/criancas`, `/criancas/[id]`, `/perfil`.
- `/criancas/[id]`: seção "Compartilhar acompanhamento" — gerar link (escolher modo + validade), listar links ativos, revogar.

**Dono/Admin `(admin)`**:
- `/admin` (novo): painel com StatCards + gráficos recharts (matrículas/conclusões ao longo do tempo, distribuição por papel), + card "Receita — em breve".
- `/admin/cursos/*`: redesenhado; escopo por papel (instrutor vê só os próprios).
- `/admin/usuarios` (novo): tabela com busca/filtro por papel, ações (mudar papel, ativar/desativar), drawer/página de detalhe.
- `AppShell`: adicionar link "Usuários" e "Visão geral" para admin; ajustar navegação.

### Frente 4 — Área lúdica da criança

Novo route group `apps/web/src/app/(share)/` — **fora** do `AppShell`/auth:
- `layout.tsx` próprio (light-only, lúdico, tela cheia, sem sidebar).
- `acompanhamento/[token]/page.tsx`: busca `GET /acompanhamento/:token`; renderiza conforme `mode`:
  - **CRIANCA:** jornada gamificada — "mundos" nas 4 cores da logo, conquistas/medalhas, progresso, linguagem positiva, ilustrações. Sem dado clínico.
  - **RESPONSAVEL:** timeline de registros organizada e legível, dados da criança, tom acolhedor mas informativo.
  - Estados: token inválido/expirado/revogado → tela amigável dedicada.

---

## Fluxo de dados

- Web consome API via `apiFetch` (`apps/web/src/lib/api.ts`), cookies de sessão better-auth.
- Rotas admin e de share-link exigem sessão + papel/ownership.
- Rota `/acompanhamento/:token` é pública e stateless do lado do cliente: toda autorização e filtragem por modo ocorrem no servidor a partir do token.

## Tratamento de erros

- API: manter padrão atual (`4xx` com `{ error }`). Token: `404` (inexistente) / `410` (expirado/revogado).
- Web premium: estados de loading (Spinner), erro (mensagem `role="alert"`), vazio (Empty).
- Web criança: estados sempre com linguagem/ilustração amigável; nunca expor stack/erro cru.

## Testes / verificação

- API: exercitar novos endpoints (métricas agregadas, CRUD usuários com troca de papel/active, criação+revogação+expiração de link, filtragem por modo garantindo que `CRIANCA` não vaza PEI/SESSAO).
- Web: navegar cada área por papel; validar que instrutor não acessa `/admin/usuarios` nem métricas; validar as 3 telas de token (válido criança, válido responsável, inválido/expirado).
- Migração Prisma aplicada e `db:push`/migrate rodando limpo.

## Fora de escopo (YAGNI)

- Implementação de pagamento/receita (apenas placeholder visual).
- Login/conta própria de criança.
- Dark mode (removido).
- Novo role de "dono" no banco (reutiliza `admin`).
- Refatorações não relacionadas ao redesign/áreas.

## Ordem de execução (por dependência)

1. Fundação de design (tokens + primitivos, light-only).
2. Backend (schema `User.active` + `ChildShareLink`, rotas admin/users/share/acompanhamento).
3. Áreas premium (profissional + admin) sobre a nova fundação.
4. Área lúdica da criança (route group `(share)`).

> Criado em 2026-07-02 09:48 (-03) · Última modificação: 2026-07-02 09:48 (-03)
