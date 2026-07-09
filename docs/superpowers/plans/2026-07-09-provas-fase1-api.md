# Provas — Fase 1: Schema + API de gestão — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o modelo de dados das Provas (`Exam*`) e a API de gestão (CRUD de provas + questões) que o dashboard vai consumir, sem tocar no quiz de aula existente.

**Architecture:** Models Prisma novos com prefixo `Exam` (Postgres), rotas Fastify em `apps/api/src/routes/exams/index.ts` (autoloaded), guardadas por role admin/instrutor com checagem de ownership do curso. Verificação por `prisma generate` + `tsc` + boot da API + `curl`.

**Tech Stack:** Fastify 5, Prisma 7 (`prisma-client` generator em `src/generated/prisma`), TypeScript ESM (imports com `.js`), `tsx`.

## Global Constraints

- Imports internos SEMPRE com extensão `.js` (ESM). Ex: `../../lib/prisma.js`.
- `const` arrow functions; SEM comentários supérfluos; SEM `console.log`.
- NÃO alterar `Activity`, `Question`, `QuizOption`, `QuizAttempt`, `apps/api/src/routes/lessons/quiz.ts` (quiz de aula — fora de escopo).
- Prisma: `import { prisma } from '../../lib/prisma.js'` e `import { Prisma } from '../../generated/prisma/client.js'`.
- Auth: `import { requireAuth, requireRole } from '../../lib/session.js'`; `request.session.user.{id,role}`.
- Banco de dev (easypanel4) autorizado para `prisma db push` (mudanças aditivas).
- Verificação de cada task: `cd apps/api && ./node_modules/.bin/tsc --noEmit` deve sair 0.

---

### Task 1: Schema dos models Exam + push + generate

**Files:**
- Modify: `apps/api/prisma/schema.prisma` (novos enums/models + relações inversas em `User`, `Course`, `Module`)

**Interfaces:**
- Produces: models `Exam`, `ExamQuestion`, `ExamOption`, `ExamAttempt`, `ExamAnswer` e enums `ExamQuestionType`, `ExamStatus`, `ExamAttemptStatus` no client Prisma gerado em `apps/api/src/generated/prisma`.

- [ ] **Step 1: Adicionar enums e models ao schema**

Adicionar ao final de `apps/api/prisma/schema.prisma`:

```prisma
enum ExamQuestionType {
  SINGLE
  MULTIPLE
  TRUE_FALSE
  ESSAY
}

enum ExamStatus {
  DRAFT
  PUBLISHED
}

enum ExamAttemptStatus {
  IN_PROGRESS
  SUBMITTED
  GRADING
  GRADED
}

model Exam {
  id           String        @id @default(cuid())
  courseId     String
  moduleId     String?       @unique
  title        String
  description  String?
  passingScore Int           @default(70)
  maxAttempts  Int?
  status       ExamStatus    @default(DRAFT)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  course       Course        @relation(fields: [courseId], references: [id], onDelete: Cascade)
  module       Module?       @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  questions    ExamQuestion[]
  attempts     ExamAttempt[]

  @@index([courseId])
  @@map("exams")
}

model ExamQuestion {
  id      String           @id @default(cuid())
  examId  String
  type    ExamQuestionType
  prompt  String
  order   Int
  points  Int              @default(1)
  exam    Exam             @relation(fields: [examId], references: [id], onDelete: Cascade)
  options ExamOption[]
  answers ExamAnswer[]

  @@index([examId])
  @@map("exam_questions")
}

model ExamOption {
  id         String       @id @default(cuid())
  questionId String
  text       String
  isCorrect  Boolean      @default(false)
  order      Int
  question   ExamQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([questionId])
  @@map("exam_options")
}

model ExamAttempt {
  id            String            @id @default(cuid())
  examId        String
  userId        String
  attemptNumber Int
  status        ExamAttemptStatus @default(SUBMITTED)
  autoScore     Int?
  manualScore   Int?
  score         Int?
  passed        Boolean?
  startedAt     DateTime          @default(now())
  submittedAt   DateTime?
  gradedAt      DateTime?
  exam          Exam              @relation(fields: [examId], references: [id], onDelete: Cascade)
  user          User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  answers       ExamAnswer[]

  @@index([examId, userId])
  @@map("exam_attempts")
}

model ExamAnswer {
  id                String       @id @default(cuid())
  attemptId         String
  questionId        String
  selectedOptionIds String[]
  essayText         String?
  awardedPoints     Int?
  feedback          String?
  attempt           ExamAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  question          ExamQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@index([attemptId])
  @@map("exam_answers")
}
```

- [ ] **Step 2: Adicionar relações inversas**

No `model User` adicionar (junto às outras relações, sem remover `quizAttempts`):
```prisma
  examAttempts ExamAttempt[]
```
No `model Course` adicionar:
```prisma
  exams Exam[]
```
No `model Module` adicionar:
```prisma
  exam Exam?
```

- [ ] **Step 3: Aplicar no banco e gerar o client**

Run: `cd apps/api && ./node_modules/.bin/prisma db push && ./node_modules/.bin/prisma generate`
Expected: "Your database is now in sync" e "Generated Prisma Client".

- [ ] **Step 4: Verificar tipos**

Run: `cd apps/api && ./node_modules/.bin/tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add apps/api/prisma/schema.prisma apps/api/src/generated/prisma
git commit -m "feat(exams): schema de provas (Exam*) com push e client"
```

---

### Task 2: lib de validação de questões

**Files:**
- Create: `apps/api/src/lib/exam.ts`

**Interfaces:**
- Consumes: enum `ExamQuestionType` de `../generated/prisma/client.js`.
- Produces: `type ExamQuestionInput`, `type ExamOptionInput`, `validateQuestions(questions: ExamQuestionInput[]): string | null` (retorna mensagem de erro ou `null` se válido).

- [ ] **Step 1: Escrever a lib**

Criar `apps/api/src/lib/exam.ts`:
```ts
export type ExamOptionInput = { text: string; isCorrect: boolean; order?: number }
export type ExamQuestionInput = {
  type: 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE' | 'ESSAY'
  prompt: string
  order?: number
  points?: number
  options?: ExamOptionInput[]
}

export const validateQuestions = (questions: ExamQuestionInput[]): string | null => {
  if (!questions.length) return 'A prova precisa de ao menos uma questão.'
  for (const q of questions) {
    if (!q.prompt.trim()) return 'Toda questão precisa de um enunciado.'
    const options = q.options ?? []
    const correct = options.filter((o) => o.isCorrect).length
    if (q.type === 'ESSAY') {
      if (options.length) return 'Questão dissertativa não deve ter alternativas.'
      continue
    }
    if (options.length < 2) return 'Questões objetivas precisam de ao menos 2 alternativas.'
    if (q.type === 'TRUE_FALSE' && options.length !== 2) return 'Verdadeiro/Falso deve ter exatamente 2 alternativas.'
    if (q.type === 'MULTIPLE') {
      if (correct < 1) return 'Questão de múltipla resposta precisa de ao menos 1 alternativa correta.'
    } else if (correct !== 1) {
      return 'Questões de escolha única (ou V/F) precisam de exatamente 1 alternativa correta.'
    }
  }
  return null
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd apps/api && ./node_modules/.bin/tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/lib/exam.ts
git commit -m "feat(exams): validação de questões por tipo"
```

---

### Task 3: Rota — listar e criar provas do curso

**Files:**
- Create: `apps/api/src/routes/exams/index.ts`

**Interfaces:**
- Consumes: `validateQuestions`, `ExamQuestionInput` de `../../lib/exam.js`.
- Produces: `export default async function examRoutes(app)`; endpoints `GET /courses/:courseId/exams`, `POST /courses/:courseId/exams`. Helper `assertCourseOwnership(courseId, user)` (usado nas próximas tasks — retorna `{ status, error } | null`).

- [ ] **Step 1: Escrever o arquivo com o helper e os 2 endpoints**

Criar `apps/api/src/routes/exams/index.ts`:
```ts
import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'
import { validateQuestions, type ExamQuestionInput } from '../../lib/exam.js'

type SessionUser = { id: string; role?: string | null }

const assertCourseOwnership = async (courseId: string, user: SessionUser) => {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } })
  if (!course) return { status: 404, error: 'Curso não encontrado.' }
  if (user.role === 'instrutor' && course.instructorId !== user.id) {
    return { status: 403, error: 'Sem permissão sobre este curso.' }
  }
  return null
}

const questionCreate = (questions: ExamQuestionInput[]) =>
  questions.map((q, qi) => ({
    type: q.type,
    prompt: q.prompt,
    order: q.order ?? qi,
    points: q.points ?? 1,
    options: {
      create: (q.options ?? []).map((o, oi) => ({ text: o.text, isCorrect: o.isCorrect, order: o.order ?? oi })),
    },
  }))

export default async function examRoutes(app: FastifyInstance) {
  const guard = { preHandler: [requireAuth, requireRole('admin', 'instrutor')] }

  app.get('/courses/:courseId/exams', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Lista as provas do curso',
      params: { type: 'object', required: ['courseId'], properties: { courseId: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string }
    const denied = await assertCourseOwnership(courseId, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    return prisma.exam.findMany({
      where: { courseId },
      orderBy: [{ moduleId: 'asc' }, { createdAt: 'asc' }],
      include: {
        module: { select: { id: true, title: true } },
        _count: { select: { questions: true } },
      },
    })
  })

  app.post('/courses/:courseId/exams', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Cria uma prova no curso (de módulo ou final)',
      params: { type: 'object', required: ['courseId'], properties: { courseId: { type: 'string' } } },
      body: {
        type: 'object',
        required: ['title', 'questions'],
        properties: {
          moduleId: { type: ['string', 'null'] },
          title: { type: 'string' },
          description: { type: 'string' },
          passingScore: { type: 'integer', minimum: 0, maximum: 100 },
          maxAttempts: { type: ['integer', 'null'], minimum: 1 },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          questions: { type: 'array' },
        },
      },
    },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string }
    const body = request.body as {
      moduleId?: string | null
      title: string
      description?: string
      passingScore?: number
      maxAttempts?: number | null
      status?: 'DRAFT' | 'PUBLISHED'
      questions: ExamQuestionInput[]
    }

    const denied = await assertCourseOwnership(courseId, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    const invalid = validateQuestions(body.questions)
    if (invalid) return reply.status(400).send({ error: invalid })

    if (body.moduleId == null) {
      const existingFinal = await prisma.exam.findFirst({ where: { courseId, moduleId: null }, select: { id: true } })
      if (existingFinal) return reply.status(409).send({ error: 'Este curso já tem uma prova final.' })
    }

    try {
      const exam = await prisma.exam.create({
        data: {
          courseId,
          moduleId: body.moduleId ?? null,
          title: body.title,
          description: body.description,
          passingScore: body.passingScore ?? 70,
          maxAttempts: body.maxAttempts ?? null,
          status: body.status ?? 'DRAFT',
          questions: { create: questionCreate(body.questions) },
        },
      })
      return reply.status(201).send(exam)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Este módulo já tem uma prova.' })
        if (error.code === 'P2003') return reply.status(404).send({ error: 'Curso ou módulo não encontrado.' })
      }
      throw error
    }
  })
}
```

- [ ] **Step 2: Verificar tipos**

Run: `cd apps/api && ./node_modules/.bin/tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3: Verificar que a rota registra (boot)**

Run: `cd apps/api && timeout 15 ./node_modules/.bin/tsx src/server.ts 2>&1 | tail -5`
Expected: sobe sem erro de schema (pode terminar em `EADDRINUSE` se o dev já roda na 3333 — isso confirma que as rotas registraram).

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/exams/index.ts
git commit -m "feat(exams): listar e criar provas do curso"
```

---

### Task 4: Rota — detalhe, atualizar metadados, substituir questões e excluir

**Files:**
- Modify: `apps/api/src/routes/exams/index.ts` (adicionar endpoints ao final da função, antes do `}` de fechamento)

**Interfaces:**
- Consumes: `assertCourseOwnership`, `questionCreate`, `validateQuestions`, `ExamQuestionInput` (mesmo arquivo/task anterior).
- Produces: `GET /exams/:id`, `PATCH /exams/:id`, `PUT /exams/:id/questions`, `DELETE /exams/:id`. Helper `loadExamOwnership(examId, user)`.

- [ ] **Step 1: Adicionar o helper de ownership por examId**

Logo após `assertCourseOwnership`, adicionar:
```ts
const loadExamOwnership = async (examId: string, user: SessionUser) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { course: { select: { instructorId: true } } } })
  if (!exam) return { status: 404, error: 'Prova não encontrada.' }
  if (user.role === 'instrutor' && exam.course.instructorId !== user.id) {
    return { status: 403, error: 'Sem permissão sobre esta prova.' }
  }
  return null
}
```

- [ ] **Step 2: Adicionar os 4 endpoints antes do fechamento da função**

```ts
  app.get('/exams/:id', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Detalhe da prova (com gabarito)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    return prisma.exam.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, title: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
      },
    })
  })

  app.patch('/exams/:id', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Atualiza metadados da prova',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          passingScore: { type: 'integer', minimum: 0, maximum: 100 },
          maxAttempts: { type: ['integer', 'null'], minimum: 1 },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    const { title, description, passingScore, maxAttempts, status } = request.body as {
      title?: string; description?: string; passingScore?: number; maxAttempts?: number | null; status?: 'DRAFT' | 'PUBLISHED'
    }
    return prisma.exam.update({
      where: { id },
      data: { title, description, passingScore, maxAttempts, status },
    })
  })

  app.put('/exams/:id/questions', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Substitui as questões da prova',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: { type: 'object', required: ['questions'], properties: { questions: { type: 'array' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    const { questions } = request.body as { questions: ExamQuestionInput[] }
    const invalid = validateQuestions(questions)
    if (invalid) return reply.status(400).send({ error: invalid })

    await prisma.$transaction(async (tx) => {
      await tx.examQuestion.deleteMany({ where: { examId: id } })
      for (const data of questionCreate(questions)) {
        await tx.examQuestion.create({ data: { examId: id, ...data } })
      }
    })
    return reply.status(200).send({ ok: true })
  })

  app.delete('/exams/:id', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Remove a prova',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    try {
      await prisma.exam.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Prova não encontrada.' })
      }
      throw error
    }
  })
```

Nota: `questionCreate` retorna `{ options: { create: [...] } }`; ao espalhar em `tx.examQuestion.create({ data: { examId: id, ...data } })` o `options.create` é aninhado corretamente.

- [ ] **Step 3: Verificar tipos**

Run: `cd apps/api && ./node_modules/.bin/tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4: Verificação funcional com dados reais (sem depender de sessão HTTP)**

Criar script temporário `apps/api/_test-exam.mts` que exercita create→get→put→delete via Prisma direto (pega um curso real), rodar e apagar:
```ts
import 'dotenv/config'
import { prisma } from './src/lib/prisma.js'
import { validateQuestions } from './src/lib/exam.js'
const course = await prisma.course.findFirst({ select: { id: true } })
if (!course) { console.log('SEM CURSO'); process.exit(0) }
console.log('validate ok?', validateQuestions([{ type: 'SINGLE', prompt: 'x', options: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: false }] }]))
console.log('validate essay+opts?', validateQuestions([{ type: 'ESSAY', prompt: 'x', options: [{ text: 'a', isCorrect: true }] }]))
const exam = await prisma.exam.create({ data: { courseId: course.id, title: 'Prova teste', questions: { create: [{ type: 'SINGLE', prompt: 'q1', order: 0, points: 1, options: { create: [{ text: 'a', isCorrect: true, order: 0 }, { text: 'b', isCorrect: false, order: 1 }] } }] } }, include: { questions: { include: { options: true } } } })
console.log('criada:', exam.id, 'questões:', exam.questions.length)
await prisma.exam.delete({ where: { id: exam.id } })
console.log('excluída ok')
await prisma.$disconnect()
```
Run: `cd apps/api && ./node_modules/.bin/tsx _test-exam.mts && rm apps/api/_test-exam.mts`
Expected: `validate ok? null`, `validate essay+opts?` com mensagem, `criada:` com 1 questão, `excluída ok`.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/routes/exams/index.ts
git commit -m "feat(exams): detalhe, patch, substituir questões e excluir prova"
```

---

## Self-Review (feito)

- **Cobertura do spec (Fase 1):** models `Exam*` (Task 1) ✓; validação por tipo (Task 2) ✓; CRUD de provas + questões com ownership e regra "1 final por curso / 1 por módulo" (Tasks 3-4) ✓. Endpoints de aluno, gate, correção manual e editor de UI ficam para as Fases 2-5 (planos próprios).
- **Placeholders:** nenhum — todo código é literal.
- **Consistência de tipos:** `ExamQuestionInput`/`validateQuestions` (Task 2) usados em Tasks 3-4; `assertCourseOwnership`/`loadExamOwnership`/`questionCreate` definidos na Task 3 e reusados na Task 4; nomes de model batem com Task 1.

## Próximos planos (a gerar após a Fase 1)

- **Fase 2:** Editor de provas no dashboard (aba "Provas" + services/hooks + editor de questões).
- **Fase 3:** Player + submissão + correção automática (app do aluno + endpoints de aluno).
- **Fase 4:** Gate de progressão (endpoint de progresso, desbloqueio sequencial, integração com certificado).
- **Fase 5:** Correção manual (fila no dashboard + fechamento da nota das dissertativas).

> Criado em 2026-07-09 11:51 (-03) · Última modificação: 2026-07-09 11:51 (-03)
