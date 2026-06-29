# Backend LMS — Plataforma Full Time (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Continuação do plano de fundação (`2026-06-27-fundacao.md`, Tasks 1-5 concluídas). Este plano cobre o **backend completo** (Task 6 adaptada + LMS core + módulo children). Frontend (fundação Tasks 7-8) fica fora deste plano.

**Goal:** Entregar todas as rotas de backend da plataforma — autenticação (better-auth + Resend), LMS (courses → modules → lessons/attachments → enrollments/progress/certificate) e o módulo plugável de gestão de crianças (children/records) — sobre Fastify 5 + Prisma 7, seguindo as convenções do `spotdrive-back`.

**Architecture:** `apps/api` (Fastify 5, ESM, `@fastify/autoload` com `dirNameRoutePrefix: false` → cada rota declara o **path completo**). better-auth em `/auth`, Prisma 7 (`@prisma/adapter-pg`) contra Postgres remoto (easypanel). RBAC por roles globais (`admin|instrutor|profissional`) via `requireAuth`/`requireRole` na borda da rota.

**Tech Stack:** Fastify 5.8, better-auth 1.6, Prisma 7.8 + @prisma/adapter-pg, PostgreSQL 17, **Resend** (e-mail transacional), TypeScript 5.9, tsx.

## Global Constraints

- **ESM puro:** imports relativos com extensão `.js`; `const` arrow functions exceto o `export default async function(app)` exigido pelo autoload.
- **Autoload `dirNameRoutePrefix: false`:** o nome da pasta NÃO é prefixo. Cada handler declara o path completo (ex.: `app.get('/courses', …)`). Padrão já estabelecido em `routes/health/index.ts`.
- **Toda rota** inclui `schema: { tags: [...], summary: '...' }` (Swagger/Scalar) e, quando recebe body/params/query, valida via **Fastify JSON Schema** (`schema.body|params|querystring`).
- **Sem `console.*`** em código entregue (usar `app.log`). **Sem comentários supérfluos.** Sem type annotations/comentários em código não modificado.
- **Roles:** `admin`, `instrutor`, `profissional`. Default signup = `profissional`. `requireRole(...)` sempre **após** `requireAuth` no array de `preHandler`.
- **Banco:** Postgres remoto via `apps/api/.env` (gitignored, já conectado). `datasource db` sem `url` no schema (vem de `prisma.config.ts` via `env('DATABASE_URL')`).
- **E-mail:** **Resend** (`RESEND_API_KEY`, `MAIL_FROM` no `.env`) — NÃO nodemailer/SMTP. Sem `console.warn` de fallback; se faltar a key, logar via `app`/retornar silenciosamente não se aplica — usar o SDK e deixar o erro propagar no log do Fastify.
- **Prisma client:** só em `apps/api`. Singleton em `src/lib/prisma.ts` (já existe).
- **IDs:** `cuid()`. **Maps de tabela no plural** (`@@map`). Timestamps `createdAt`/`updatedAt` em todos os modelos novos.
- **Commits:** um por task concluída, mensagem `feat(api): ...`.

## RBAC (do spec de design)

| Ação | Exigência |
|------|-----------|
| Listar/ver curso **publicado** | público (sem auth) |
| Criar/editar/publicar/excluir curso, módulo, aula, attachment | `requireRole('admin','instrutor')` |
| Ver curso **draft**, listar todos | `requireRole('admin','instrutor')` |
| Matricular-se, ver progresso, completar aula, gerar/ver certificado | `requireAuth` (qualquer role logado) |
| Gerir crianças e records | `requireAuth` + dono (`ownerProfId === session.user.id`) |
| Administrar usuários | `requireRole('admin')` |

---

## Task 6: better-auth na API (ADAPTADO: Resend) + session + users/me

**Files:**
- Create: `apps/api/src/lib/mail.ts` (Resend)
- Create: `apps/api/src/lib/auth.ts`
- Create: `apps/api/src/lib/session.ts`
- Create: `apps/api/src/routes/auth/index.ts`
- Create: `apps/api/src/routes/users/index.ts`

**Interfaces:**
- Consumes: `prisma` (`src/lib/prisma.ts`).
- Produces:
  - `sendEmail(opts: { to: string; subject: string; html: string }): Promise<void>` via Resend SDK (`new Resend(process.env.RESEND_API_KEY)`, `resend.emails.send({ from: process.env.MAIL_FROM, to, subject, html })`).
  - `auth` (instância better-auth; `basePath: '/auth'`, `baseURL` de `BETTER_AUTH_URL`, `secret`, `database: prismaAdapter(prisma, { provider: 'postgresql' })`, `emailAndPassword` com `requireEmailVerification: true` + `sendResetPassword`, `emailVerification` com `sendOnSignUp`/`autoSignInAfterVerification`/`sendVerificationEmail`, `user.additionalFields.role` `{ type:'string', required:false, defaultValue:'profissional', input:false }`, `session.expiresIn`/`updateAge`, `advanced.crossSubDomainCookies` condicionado a `COOKIE_DOMAIN`, `trustedOrigins: [FRONTEND_URL, BETTER_AUTH_URL]`). E-mails usam template HTML com a marca (navy `#003060`, amber `#f5b500`).
  - `type Session`, `type Role = 'admin'|'instrutor'|'profissional'`, augmentation `declare module 'fastify'` com `session: Session`.
  - `requireAuth(request, reply)` — popula `request.session` via `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })` ou responde 401.
  - `requireRole(...roles: Role[])` — preHandler que exige `request.session.user.role ∈ roles`, senão 403.
  - Rota catch-all `app.route({ method:['GET','POST'], url:'/auth/*', schema:{ tags:['auth'], hide:true }, handler })` montando `auth.handler` (padrão oficial better-auth p/ Fastify: `fromNodeHeaders` + `new Request` + repassar status/headers/body, `try/catch` logando via `app.log.error`).
  - `GET /users/me` (`preHandler: requireAuth`) → `{ id, name, email, role, image }` do `request.session.user`.

**Detalhes da adaptação Resend** (substitui o `mail.ts` do plano de fundação):
```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (opts: { to: string; subject: string; html: string }) => {
  await resend.emails.send({ from: process.env.MAIL_FROM!, ...opts })
}
```
Adicionar `resend` às dependencies do `apps/api/package.json` (`pnpm --filter @fulltime/api add resend`). Remover `nodemailer`/`@types/nodemailer` se presentes.

**Restante:** `auth.ts`, `session.ts`, `routes/auth/index.ts`, `routes/users/index.ts` seguem o plano de fundação Task 6 (Steps 2-5) verbatim, exceto a troca do import de mail. Reusar o template `brandEmail(title, body, cta)` de lá.

**Verificação:**
- `pnpm --filter @fulltime/api exec tsc --noEmit` → sem erros.
- `pnpm --filter @fulltime/api dev`; em outro terminal: `curl -X POST http://localhost:3333/auth/sign-up/email -H "Content-Type: application/json" -d '{"name":"Teste","email":"teste@fulltime.com","password":"senha12345"}'` → 200 com usuário; `curl http://localhost:3333/users/me` sem cookie → 401.

**Commit:** `feat(api): better-auth (email/senha + verificacao via resend) com roles e /users/me`

---

## Task 7: Schema extension — modelos LMS + children (BLOQUEANTE de todas as rotas)

**Files:**
- Edit: `apps/api/prisma/schema.prisma`

**Interfaces:**
- Produces: enums + modelos abaixo, `db push` aplicado, client regenerado. Adiciona relations no `User` existente (não remover campos atuais).

**Enums:**
```prisma
enum CourseStatus { DRAFT PUBLISHED }
enum VideoSource  { MUX YOUTUBE VIMEO NONE }
enum EnrollmentStatus { ACTIVE COMPLETED CANCELLED }
enum ChildRecordType { EVOLUCAO SESSAO PEI }
```

**Modelos** (todos com `id String @id @default(cuid())`, `createdAt`/`updatedAt` salvo onde indicado, `@@map` plural):
- `ProfileProf` — `userId String @unique` (1-1 com User), `area String?`, `registro String?`, `bio String?`. Relation `user User @relation(fields:[userId], references:[id], onDelete: Cascade)`. `@@map("profile_profs")`.
- `Course` — `slug String @unique`, `title String`, `description String?`, `coverImage String?`, `status CourseStatus @default(DRAFT)`, `instructorId String`, relations: `instructor User @relation("CourseInstructor", fields:[instructorId], references:[id])`, `modules Module[]`, `enrollments Enrollment[]`. `@@map("courses")`.
- `Module` — `courseId String`, `title String`, `order Int`, relations `course` (onDelete Cascade), `lessons Lesson[]`. `@@index([courseId])`. `@@map("modules")`.
- `Lesson` — `moduleId String`, `title String`, `order Int`, `content String?` (rich/markdown), `videoSource VideoSource @default(NONE)`, `videoRef String?`, `durationSec Int?`, relations `module` (onDelete Cascade), `attachments Attachment[]`, `progress LessonProgress[]`. `@@index([moduleId])`. `@@map("lessons")`.
- `Attachment` — `lessonId String`, `name String`, `url String`, `type String?`, relation `lesson` (onDelete Cascade). `@@map("attachments")`.
- `Enrollment` — `userId String`, `courseId String`, `status EnrollmentStatus @default(ACTIVE)`, `enrolledAt DateTime @default(now())`, relations `user`(Cascade), `course`(Cascade), `progress LessonProgress[]`, `certificate Certificate?`. `@@unique([userId, courseId])`. `@@map("enrollments")`.
- `LessonProgress` — `enrollmentId String`, `lessonId String`, `completedAt DateTime @default(now())`, relations `enrollment`(Cascade), `lesson`(Cascade). `@@unique([enrollmentId, lessonId])`. `@@map("lesson_progress")`.
- `Certificate` — `enrollmentId String @unique`, `code String @unique`, `issuedAt DateTime @default(now())`, `url String?`, relation `enrollment`(Cascade). `@@map("certificates")`.
- `Child` — `ownerProfId String`, `name String`, `birthDate DateTime?`, `diagnosis String?`, relations `owner User @relation("ChildOwner", fields:[ownerProfId], references:[id], onDelete: Cascade)`, `records ChildRecord[]`. `@@index([ownerProfId])`. `@@map("children")`.
- `ChildRecord` — `childId String`, `authorId String`, `type ChildRecordType`, `content String`, `date DateTime @default(now())`, relations `child`(Cascade), `author User @relation("RecordAuthor", fields:[authorId], references:[id])`. `@@index([childId])`. `@@map("child_records")`.

**Relations a adicionar no `User`** (manter o resto):
```prisma
  profile      ProfileProf?
  courses      Course[]      @relation("CourseInstructor")
  enrollments  Enrollment[]
  children     Child[]       @relation("ChildOwner")
  records      ChildRecord[] @relation("RecordAuthor")
```

**Verificação:**
- `pnpm --filter @fulltime/api db:push` → "in sync"; tabelas criadas.
- `pnpm --filter @fulltime/api db:generate; pnpm --filter @fulltime/api exec tsc --noEmit` → sem erros.

**Commit:** `feat(api): schema lms + children (course/module/lesson/enrollment/certificate/child)`

---

## Task 8: `lib/video.ts` + rotas `courses`

**Files:**
- Create: `apps/api/src/lib/video.ts`
- Create: `apps/api/src/routes/courses/index.ts`

**Interfaces:**
- `lib/video.ts` (abstração thin, embed-only nesta fase): `resolveVideo(source: VideoSource, ref: string | null): { source: VideoSource; embedUrl: string | null }`. `YOUTUBE` → `https://www.youtube.com/embed/${ref}`; `VIMEO` → `https://player.vimeo.com/video/${ref}`; `MUX` → `null` (placeholder, provider real depois); `NONE` → `null`.
- Rotas (path completo):
  - `GET /courses` — público. Sem auth: retorna só `status=PUBLISHED`. Query opcional `?status=` ignorada para não-admin. Inclui `instructor {id,name}` e contagem de módulos. Ordsenar por `createdAt desc`.
  - `GET /courses/:slug` — público se `PUBLISHED`; se `DRAFT`, exige `requireRole('admin','instrutor')` (checar sessão dentro do handler: tentar `getSession`; se draft e não autorizado → 404). Inclui `modules` (com `lessons` resumidas: id, title, order, durationSec) ordenados por `order`.
  - `POST /courses` — `requireRole('admin','instrutor')`. Body `{ title, description?, coverImage?, slug? }`. Se `slug` ausente, derivar de `title` (slugify simples: lowercase, espaços→`-`, remover não-alfanum). `instructorId = session.user.id`. Retorna 201 + course.
  - `PATCH /courses/:id` — `requireRole('admin','instrutor')`. Body parcial `{ title?, description?, coverImage?, slug?, status? }`. Retorna course atualizado.
  - `POST /courses/:id/publish` — `requireRole('admin','instrutor')`. Seta `status=PUBLISHED`. Retorna course.
  - `DELETE /courses/:id` — `requireRole('admin','instrutor')`. 204.

**Notas:** validar params/body via Fastify JSON schema. `slug` único → tratar conflito retornando 409 com mensagem clara (capturar erro P2002 do Prisma). Não criar abstração de slugify reutilizável se usada 1x — inline.

**Verificação:** `tsc --noEmit` limpo; com a API rodando, criar curso autenticado como instrutor (após verificar e-mail no DB) e `GET /courses` lista o publicado.

**Commit:** `feat(api): rotas de courses (crud + publish + video embed)`

---

## Task 9: rotas `modules`

**Files:**
- Create: `apps/api/src/routes/modules/index.ts`

**Interfaces** (todas `requireRole('admin','instrutor')`, path completo):
- `POST /courses/:courseId/modules` — body `{ title, order? }`. Se `order` ausente, usar `(max(order) do curso) + 1`. 201 + module.
- `PATCH /modules/:id` — body `{ title?, order? }`.
- `DELETE /modules/:id` — 204 (cascade apaga lessons).
- `PATCH /modules/:id/reorder` — body `{ order: number }` (atalho explícito p/ reordenar). *(Opcional — se trivial, incluir; senão, `order` no PATCH cobre.)*

**Verificação:** `tsc --noEmit` limpo; criar módulo num curso existente retorna 201 com `order` correto.

**Commit:** `feat(api): rotas de modules`

---

## Task 10: rotas `lessons` + `attachments`

**Files:**
- Create: `apps/api/src/routes/lessons/index.ts`

**Interfaces** (mutações `requireRole('admin','instrutor')`, path completo):
- `POST /modules/:moduleId/lessons` — body `{ title, content?, videoSource?, videoRef?, durationSec?, order? }`. `order` default = próximo do módulo. 201 + lesson.
- `GET /lessons/:id` — `requireAuth`. Retorna lesson + `attachments` + vídeo resolvido via `resolveVideo(videoSource, videoRef)`.
- `PATCH /lessons/:id` — body parcial dos campos acima.
- `DELETE /lessons/:id` — 204.
- `POST /lessons/:lessonId/attachments` — body `{ name, url, type? }`. 201 + attachment.
- `DELETE /attachments/:id` — 204.

**Verificação:** `tsc --noEmit` limpo; criar lesson YOUTUBE e `GET /lessons/:id` retorna `embedUrl` correto.

**Commit:** `feat(api): rotas de lessons + attachments (com video embed)`

---

## Task 11: rotas `enrollments` + progresso + certificado

**Files:**
- Create: `apps/api/src/routes/enrollments/index.ts`
- Create: `apps/api/src/lib/certificate.ts` (gerador de `code`)

**Interfaces:**
- `lib/certificate.ts`: `generateCertificateCode(): string` — código legível único (ex.: `FT-` + 8 chars base32 do random). Sem geração de PDF nesta fase (`url` fica `null`).
- Rotas (`requireAuth`, path completo):
  - `POST /courses/:courseId/enroll` — cria `Enrollment` (status ACTIVE) para `session.user.id`. Idempotente: se já existe, retorna a existente (200) em vez de violar o unique. Só permite matrícula em curso `PUBLISHED` (senão 403/404). 201 + enrollment.
  - `GET /enrollments` — lista matrículas do usuário logado, com `course {id,slug,title,coverImage}` e `progressCount`/`totalLessons`.
  - `GET /enrollments/:id` — detalhe (dono apenas, senão 403). Inclui progresso por lesson e `certificate` se houver.
  - `POST /enrollments/:id/lessons/:lessonId/complete` — dono apenas. Cria `LessonProgress` (idempotente via unique). Valida que a lesson pertence ao curso da matrícula. Retorna `{ completed, totalLessons, completedLessons }`.
  - `POST /enrollments/:id/certificate` — dono apenas. Emite `Certificate` **somente se** todas as lessons do curso têm `LessonProgress` nesta matrícula; senão 422 com `{ error, completedLessons, totalLessons }`. Ao emitir, setar `enrollment.status=COMPLETED`. Idempotente (se já emitido, retorna o existente). 201 + certificate.
  - `GET /enrollments/:id/certificate` — dono apenas. Retorna certificado ou 404.

**Notas:** a checagem de conclusão conta `Lesson` via `Module.courseId === enrollment.courseId`. Usar uma transação ao emitir certificado + atualizar status.

**Verificação:** `tsc --noEmit` limpo; fluxo: enroll → completar todas as lessons → emitir certificado retorna code; emitir com lessons faltando → 422.

**Commit:** `feat(api): rotas de enrollments (matricula + progresso + certificado)`

---

## Task 12: rotas `children` + `records` (módulo plugável)

**Files:**
- Create: `apps/api/src/routes/children/index.ts`

**Interfaces** (`requireAuth` + checagem de dono `ownerProfId === session.user.id`, path completo):
- `GET /children` — lista crianças do dono logado.
- `POST /children` — body `{ name, birthDate?, diagnosis? }`. `ownerProfId = session.user.id`. 201.
- `GET /children/:id` — dono apenas (senão 404), inclui `records` ordenados por `date desc`.
- `PATCH /children/:id` — dono apenas. Body parcial.
- `DELETE /children/:id` — dono apenas. 204 (cascade records).
- `POST /children/:childId/records` — dono da criança apenas. Body `{ type, content, date? }` (`type ∈ EVOLUCAO|SESSAO|PEI`). `authorId = session.user.id`. 201.
- `GET /children/:childId/records` — dono apenas. Lista records.
- `DELETE /records/:id` — apenas o autor (`authorId === session.user.id`). 204.

**Notas:** centralizar a checagem de dono num helper local (`assertOwner(child, session)` ou inline) — não criar abstração global se não reusada fora deste arquivo.

**Verificação:** `tsc --noEmit` limpo; criar criança, adicionar record, listar; acessar criança de outro usuário → 404.

**Commit:** `feat(api): rotas de children + records (modulo plugavel)`

---

## Notas de execução

- **Verificação de e-mail em dev:** signup exige `emailVerified`. Para testar rotas autenticadas sem Resend entregar, marcar `users.emailVerified = true` direto no banco (Prisma Studio ou SQL) ou usar o link de verificação real (Resend configurado).
- **Padrão de erro Prisma:** capturar `P2002` (unique) → 409; `P2025` (not found) → 404. Não criar middleware global de erro nesta fase salvo se trivial.
- **Ordem é dependência real:** Task 7 (schema) bloqueia 8-12; dentro do LMS, courses → modules → lessons → enrollments. children (12) é independente de enrollments, mas depende do schema (7).
- **Sem fan-out de implementers em paralelo** — todas as tasks tocam `apps/api` e o schema/client compartilhado; execução sequencial (um implementer por task) conforme SDD.

> Criado em 2026-06-27 14:05 (-03) · Última modificação: 2026-06-27 14:05 (-03)
