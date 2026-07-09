# Materiais, Transcrição e Atividades (Quiz) nas Aulas

## Objetivo

Permitir que instrutores cadastrem **materiais** (arquivos/links), **transcrição** e **atividades (quiz de múltipla escolha)** nas aulas pelo dashboard, e que o aluno consuma tudo isso no player (`/aprender/[slug]`). Transcrição e materiais já são exibidos no player e existem no banco — falta o cadastro. Atividades são greenfield.

## Decisões

- **Materiais:** upload de arquivo (PDF/doc/zip/imagem, hospedado pela API) **e** link externo.
- **Quiz:** persiste tentativas e nota do aluno (histórico).
- **Entrega:** tudo numa fase só.
- **Quiz por aula:** 1 quiz por aula, com N perguntas.

## Escopo

### A. Materiais + Transcrição

**API**
- `POST /modules/:moduleId/lessons` e `PATCH /lessons/:id`: aceitar `transcript` no schema, destructuring e `data`.
- Upload de arquivos genéricos: novo `POST /uploads/file` (base64 dataUrl, grava em `public/uploads`, retorna `{ publicUrl }`), aceitando `application/pdf`, `msword`/`officedocument.*`, `zip`, além das imagens já suportadas. Limite 25 MB. `extFromType` estendido.
- Attachments já têm `POST /lessons/:lessonId/attachments` (name, url, type) e `DELETE /attachments/:id` — reaproveitar. Materiais via upload → `publicUrl` vira `url`; materiais via link → `url` externa direta.

**Dashboard**
- `services/uploads.ts`: `uploadFile(file)` (dataURL → `POST /uploads/file`).
- `services/courses-detail.ts`: tipos `UpdateLessonInput`/`CreateLessonInput` e `CourseLessonNode` ganham `transcript`; funções `createAttachment(lessonId, {name,url,type})` e `deleteAttachment(id)`.
- `hooks/use-course-detail.ts`: `useCreateAttachment`, `useDeleteAttachment`.
- `EditLessonSheet`: ao abrir, busca `GET /lessons/:id` (traz `content`, `transcript`, `attachments`). Novos campos: **Descrição** (`content`), **Transcrição** (textarea), seção **Materiais** (enviar arquivo ou colar link → cria attachment; lista com remover). Envio inclui `content` e `transcript`.
- `ContentForm` (criação): adiciona campo **Transcrição** (opcional). Materiais e quiz só na edição (dependem do `lessonId` já criado).

### B. Atividades (Quiz)

**Prisma (models novos)**
```prisma
model Activity {
  id        String   @id @default(cuid())
  lessonId  String   @unique
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lesson    Lesson       @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  questions Question[]
  attempts  QuizAttempt[]
  @@map("activities")
}

model Question {
  id         String       @id @default(cuid())
  activityId String
  statement  String
  order      Int
  activity   Activity     @relation(fields: [activityId], references: [id], onDelete: Cascade)
  options    QuizOption[]
  @@index([activityId])
  @@map("questions")
}

model QuizOption {
  id         String   @id @default(cuid())
  questionId String
  text       String
  isCorrect  Boolean  @default(false)
  order      Int
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  @@index([questionId])
  @@map("quiz_options")
}

model QuizAttempt {
  id         String   @id @default(cuid())
  activityId String
  userId     String
  score      Int
  total      Int
  answers    Json
  createdAt  DateTime @default(now())
  activity   Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([activityId, userId])
  @@map("quiz_attempts")
}
```
Adicionar relação inversa `activity Activity?` em `Lesson` e `quizAttempts QuizAttempt[]` em `User`. Aplicar com `db push` (padrão do projeto em dev).

**API — endpoints (`routes/lessons/index.ts` ou novo `routes/activities/`)**
- `GET /lessons/:id/quiz` — retorna o quiz com perguntas e opções. Para **aluno**, omite `isCorrect`; para **admin/instrutor**, inclui. Inclui `lastAttempt` do usuário (score/total) se houver.
- `PUT /lessons/:id/quiz` (admin/instrutor) — upsert do quiz inteiro: recebe `{ title, questions: [{ statement, order, options: [{ text, isCorrect, order }] }] }`, recria perguntas/opções (delete-and-create dentro de transação). Valida: cada pergunta tem ≥2 opções e exatamente 1 correta.
- `DELETE /lessons/:id/quiz` (admin/instrutor) — remove o quiz.
- `POST /lessons/:id/quiz/submit` (requireAuth) — recebe `{ answers: { [questionId]: optionId } }`; corrige, cria `QuizAttempt`, retorna `{ score, total, corrections: [{ questionId, correctOptionId, chosenOptionId, correct }] }`.
- `GET /lessons/:id/quiz/attempts` (requireAuth) — histórico do usuário para a aula.

**Player (`app-streaming`)**
- Tipos em `lib/types.ts`: `Quiz`, `QuizQuestion`, `QuizOption` (sem gabarito), `QuizSubmitResult`, `QuizAttempt`.
- `LessonTabs.tsx` aba **Atividades**: busca `GET /lessons/:id/quiz`; renderiza perguntas com radios; botão Enviar → `POST .../submit`; mostra resultado (acertou X/Y, marca certas/erradas) e permite refazer. Mostra melhor/última tentativa.
- Novo componente `player/QuizPanel.tsx` para isolar a lógica (LessonTabs já é grande).

**Dashboard**
- `services/` + `hooks/`: `getQuiz(lessonId)`, `saveQuiz(lessonId, payload)`, `deleteQuiz(lessonId)` e hooks correspondentes.
- Novo componente `course-detail/quiz-editor-sheet.tsx` (ou seção): acionado a partir da aula ("Editar atividade"), monta perguntas/alternativas, marca a correta, salva via `PUT`.

## Componentes e responsabilidades

- **API `uploads`** — hospedar arquivos genéricos; retorna URL pública.
- **API `lessons`** — gravar transcript; CRUD de attachments (já existe); CRUD do quiz e submissão/correção.
- **Dashboard `EditLessonSheet`** — editar descrição/transcrição/materiais da aula.
- **Dashboard `quiz-editor-sheet`** — montar o quiz.
- **Player `QuizPanel`** — responder o quiz e ver correção/histórico.

## Fora de escopo

- Integração do resultado do quiz com progresso/conclusão do curso ou certificado.
- Tipos de questão além de múltipla escolha (V/F, dissertativa).
- Reordenação drag-and-drop de perguntas (usar campo `order` numérico simples).
- Edição de material existente (mantém deletar-e-recriar).

## Riscos / atenção

- `GET /courses/:slug` tem `select` restrito nas lessons — o dashboard deve buscar a aula por `GET /lessons/:id` ao editar, não confiar no payload do curso.
- Vazamento de gabarito: garantir que `isCorrect` nunca vá ao aluno no `GET /lessons/:id/quiz`.
- Validação do quiz no `PUT` (≥2 opções, 1 correta) para não salvar quiz inválido.

> Criado em 2026-07-09 10:57 (-03) · Última modificação: 2026-07-09 10:57 (-03)
