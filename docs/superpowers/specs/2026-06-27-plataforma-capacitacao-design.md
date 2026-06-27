# Plataforma de Capacitação — Instituição de Ensino para Crianças Atípicas

## Visão geral

Plataforma de **capacitação de profissionais** (pedagogos, terapeutas, professores, cuidadores) que querem aprender a trabalhar com crianças atípicas (TEA, TDAH, etc.). Modelo **híbrido**:

- **Site institucional público** — landing, sobre, catálogo público de cursos.
- **Área logada (LMS)** — profissionais se matriculam em cursos, assistem aulas, acompanham progresso e recebem certificado.
- **Módulo plugável "gestão de crianças"** — o profissional pode (opcionalmente) cadastrar e acompanhar crianças atípicas reais (prontuário/evolução). Não é o núcleo; entra como fase posterior, mas o modelo de dados já prevê a relação.

Núcleo do MVP = o LMS. Pagamentos ficam fora do MVP (cursos gratuitos).

## Decisões técnicas

| Área | Decisão |
|------|---------|
| Monorepo | Turborepo + pnpm |
| Frontend | Next.js 15 (App Router) — `apps/web` |
| Backend | Fastify 5 (ESM) — `apps/api`, seguindo as convenções do `spotdrive-back` |
| Banco | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) |
| Auth | better-auth (emailAndPassword + verificação de e-mail, magicLink, emailOTP, plugin `admin`) |
| Roles | Globais: `admin`, `instrutor`, `profissional` (sem workspaces) |
| Vídeo | Abstração de provider: upload próprio (Cloudflare Stream/Mux, fluxo presign) **e** embed de YouTube/Vimeo por link |
| Docs API | Swagger + Scalar em `/docs` |
| Pagamentos | Fora do MVP (cursos gratuitos) |

## Estrutura do monorepo

```
fulltime/
├── apps/
│   ├── web/                      # Next.js 15 — público + área logada (LMS)
│   └── api/                      # Fastify — convenções do spotdrive-back
│       ├── prisma/schema.prisma
│       ├── prisma.config.ts
│       ├── public/               # logo p/ e-mails + assets (/static)
│       └── src/
│           ├── server.ts         # Fastify + autoload + cors + swagger/scalar
│           ├── routes/           # 1 subpasta = 1 plugin (autoload)
│           │   ├── health/
│           │   ├── auth/         # monta handler do better-auth
│           │   ├── courses/
│           │   ├── modules/
│           │   ├── lessons/
│           │   ├── enrollments/  # matrícula + progresso + certificado
│           │   ├── users/
│           │   └── children/     # módulo plugável
│           └── lib/
│               ├── prisma.ts     # singleton + @prisma/adapter-pg
│               ├── auth.ts       # config better-auth
│               ├── session.ts    # requireAuth, requireRole
│               ├── mail.ts       # nodemailer (e-mails transacionais)
│               └── video.ts      # abstração Mux/Cloudflare + embed YT/Vimeo
│
├── packages/
│   ├── ui/                       # design system (cores do logo, componentes acessíveis)
│   ├── config-ts/                # tsconfig base compartilhado
│   └── config-eslint/            # config ESLint compartilhada
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### Convenções da `apps/api` (herdadas do `spotdrive-back`)

- **Fastify 5, ESM** (`"type":"module"`, imports com extensão `.js`); dev com `tsx watch src/server.ts`, build com `tsc`.
- **Roteamento via `@fastify/autoload`** sobre `src/routes/`. Cada subpasta é um plugin Fastify; o nome da pasta vira o prefixo da rota (`routes/courses/` → `/courses`). Cada `index.ts` exporta `default async function(app: FastifyInstance)` e registra os handlers direto no `app`.
- **`src/lib/`** concentra serviços compartilhados (prisma, auth, session, mail, video).
- **Prisma 7** com `@prisma/adapter-pg`; entrypoint de produção usa `prisma db push` → `prisma generate` → start.
- **Swagger + Scalar em `/docs`**; cada rota inclui `schema: { tags, summary }`.
- **CORS** com `origin: true` + `credentials: true` (sessão httpOnly).

**Diferença consciente vs. spotdrive:** o spotdrive usa RBAC por *workspace* (`requirePermission('resource:action')` + header `X-Workspace-Id`). Aqui não há workspaces — são **roles globais**. Mantemos `requireAuth` idêntico e substituímos por **`requireRole('admin','instrutor')`** na borda da rota.

## Modelo de dados (Prisma)

### Autenticação / pessoas (better-auth gera parte)
```
User            id, name, email, emailVerified, image,
                role(admin|instrutor|profissional), createdAt
Session         (better-auth)
Account         (better-auth — credenciais/OAuth)
Verification    (better-auth)
ProfileProf     userId → dados extras do profissional (área de atuação, registro, bio)
```

### LMS (núcleo)
```
Course          id, slug, title, description, coverImage,
                status(draft|published), instructorId → User, createdAt
Module          id, courseId, title, order
Lesson          id, moduleId, title, order, content(rich),
                videoSource(MUX|YOUTUBE|VIMEO|NONE), videoRef, durationSec
Attachment      id, lessonId, name, url, type

Enrollment      id, userId, courseId, status, enrolledAt
LessonProgress  id, enrollmentId, lessonId, completedAt
Certificate     id, enrollmentId, code, issuedAt, url
```

### Módulo "gestão de crianças" (plugável)
```
Child           id, ownerProfId → User, name, birthDate, diagnosis(notes), createdAt
ChildRecord     id, childId, authorId, type(evolução|sessão|PEI), content, date
```

### Pontos de design do modelo
- **`videoSource` + `videoRef`** é a abstração de vídeo: `MUX` guarda playbackId; `YOUTUBE`/`VIMEO` guardam o ID/URL. O front escolhe o player pelo `videoSource`.
- **Progresso por `Enrollment`** (não direto `User`↔`Lesson`) — histórico limpo, permite recomeço de matrícula.
- **`Certificate`** só é emitido quando todas as `Lesson` da matrícula têm `LessonProgress`.
- **`Child`** pertence ao profissional (`ownerProfId`), não à instituição — isolado do núcleo do LMS, fácil de ligar/desligar.

## Estrutura do `apps/web` (Next.js 15 App Router)

```
apps/web/src/app/
├── (public)/                 # site institucional — landing, sobre, catálogo público
│   ├── page.tsx
│   └── cursos/[slug]/
├── (auth)/                   # login, cadastro, recuperação (better-auth/react)
├── (app)/                    # área logada — protegida por middleware
│   ├── dashboard/
│   ├── cursos/[slug]/        # player de aula + progresso
│   ├── certificados/
│   └── criancas/             # módulo plugável
└── (admin)/                  # painel admin/instrutor — CRUD de cursos
```

- **Route Groups** separam público / auth / app / admin sem poluir a URL.
- **`web` consome a `api` via fetch tipado**; Server Components fazem fetch no servidor. Nada de Prisma no front.
- **Middleware** protege `(app)` e `(admin)` checando sessão + role.
- **Auth no front:** `better-auth/react` (`createAuthClient`) apontando pro `/auth` da API; sessão por cookie httpOnly. `profissional` é o role default no signup.

## Fluxo de vídeo (`lib/video.ts`)

- Abstração de provider com `videoSource = MUX|YOUTUBE|VIMEO|NONE` + `videoRef`.
- **Upload próprio** (Cloudflare Stream/Mux): mesmo padrão **presign** que o spotdrive usa pro S3 — gera URL de upload → cliente envia direto → commit salva o `videoRef`.
- **Embed YouTube/Vimeo:** guarda só o ID; player escolhido no front pelo `videoSource`.
- Começa com embed (zero infra) e troca pro provider real sem refazer o front.

## Autorização (RBAC simples)

| Ação | Role exigida |
|------|--------------|
| Criar/editar/publicar curso, módulo, aula | `admin`, `instrutor` |
| Administrar usuários/plataforma | `admin` |
| Matricular-se, assistir, gerar certificado | `profissional` (e acima) |
| Gerir crianças | `profissional` (dono do registro) |

`requireRole(...)` como `preHandler` na borda da rota; `requireAuth` protege toda a área logada.

## Ordem de build (incremental)

1. Scaffold Turborepo (pnpm) + `apps/web` (Next) + `apps/api` (Fastify) + `packages/config-ts`, `packages/config-eslint`, `packages/ui`.
2. `apps/api`: Prisma + schema base + `lib/prisma|auth|session|mail` + rotas `health` e `auth`.
3. LMS core na API: `courses` → `modules` → `lessons` → `enrollments` (progresso/certificado).
4. `apps/web`: auth (login/cadastro/verificação de e-mail) + middleware de proteção.
5. `apps/web`: site público + catálogo + player de aula com progresso.
6. `apps/web`: painel admin/instrutor (CRUD de cursos).
7. Módulo `children` (API + web) — fase plugável.
8. `lib/video.ts` com provider real (Mux/Cloudflare) — quando sair do embed.

## Fora de escopo (MVP)

- Pagamentos / assinatura (cursos gratuitos no MVP).
- Quizzes/avaliações, comentários, trilhas/categorias avançadas (avaliar em fase 2).
- Provider de vídeo próprio na largada (começa com embed YT/Vimeo).
- Login social (trivial de adicionar com better-auth depois).

> Criado em 2026-06-27 12:08 (-03) · Última modificação: 2026-06-27 12:08 (-03)
