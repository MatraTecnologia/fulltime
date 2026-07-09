# Provas / Avaliações com gate de progressão — Design

## Contexto

O `app-streaming` (aluno) e o `dashboard` (instrutor/admin) já têm cursos → módulos → aulas, progresso por aula (`LessonProgress`), conclusão de matrícula (`Enrollment.status`) e emissão de certificado ao concluir 100%.

Já existe (feito em paralelo, **NÃO deve ser alterado por este trabalho**) um **quiz de fixação por aula**: `Activity` (1:1 com `Lesson`) → `Question` → `QuizOption`, com `QuizAttempt`, rota `apps/api/src/routes/lessons/quiz.ts` e `QuizEditorSheet` no dashboard. É só múltipla escolha auto-corrigida, sem gate.

Esta feature adiciona um conceito **distinto e paralelo**: a **Prova** (avaliação por módulo e/ou curso, com nota mínima e **gate de progressão**). Para não colidir com os models do quiz de aula, todos os models/enums novos usam o prefixo `Exam`.

## Decisões (validadas com o usuário)

- **Vínculo:** configurável — uma prova pode ser de um **módulo** (`moduleId` preenchido) ou a **final do curso** (`moduleId` null). Um curso pode ter provas de módulo e/ou uma final.
- **Tipos de questão:** múltipla escolha (1 correta), múltipla resposta (N corretas), verdadeiro/falso, e **dissertativa** (correção manual).
- **Progressão:** **bloqueante (gate)** — o aluno só conclui o módulo/curso (libera o próximo módulo / ganha o certificado) se **aprovado** na prova.
- **Tentativas:** configurável por prova (default: ilimitadas até passar).
- **Nota mínima:** configurável por prova (default: 70%).
- **Correção:** objetivas auto-corrigidas na submissão; dissertativas corrigidas manualmente pelo instrutor.

## Modelo de dados (Prisma)

Enums: `ExamQuestionType` (SINGLE · MULTIPLE · TRUE_FALSE · ESSAY), `ExamStatus` (DRAFT · PUBLISHED), `ExamAttemptStatus` (IN_PROGRESS · SUBMITTED · GRADING · GRADED).

```
Exam           id, courseId, moduleId? (null = prova final do curso; preenchido = prova do módulo),
               title, description?, passingScore Int @default(70), maxAttempts Int? (null = ilimitado),
               status ExamStatus @default(DRAFT), timestamps
               questions ExamQuestion[]  attempts ExamAttempt[]
               // regra de app: no máx 1 prova por módulo e 1 prova final por curso

ExamQuestion   id, examId, type ExamQuestionType, prompt String, order Int, points Int @default(1)
               options ExamOption[]
ExamOption     id, questionId, text, isCorrect Boolean @default(false), order Int
               // usado por SINGLE/MULTIPLE/TRUE_FALSE; ESSAY não tem opções

ExamAttempt    id, examId, userId, attemptNumber Int, status ExamAttemptStatus,
               autoScore Int?, manualScore Int?, score Int?, passed Boolean?,
               startedAt, submittedAt?, gradedAt?
               answers ExamAnswer[]
ExamAnswer     id, attemptId, questionId,
               selectedOptionIds String[]   // objetivas
               essayText String?             // dissertativa
               awardedPoints Int?, feedback String?   // preenchidos na correção manual
```

Relações inversas a adicionar: `User.examAttempts`, `Course.exams Exam[]`, `Module.exam Exam?` (1:1 opcional — no máx uma prova por módulo; `Exam.moduleId @unique`, e como o Postgres permite múltiplos `null`, a regra de "1 prova final por curso" é validada na aplicação).

## Correção e gate

- **Submissão:** corrige as objetivas na hora → `autoScore`. Se a prova **tem** questão dissertativa → status `GRADING` (aguardando correção); senão → `GRADED`, com `score = autoScore` e `passed = score >= passingScore` (em pontos ponderados, normalizado para %).
- **Correção manual:** instrutor atribui `awardedPoints` + `feedback` por resposta dissertativa → fecha `manualScore`, `score`, `passed`, status `GRADED`, `gradedAt`.
- **Gate (derivado, sem novo model de progresso):**
  - **Módulo concluído** = todas as aulas do módulo em `LessonProgress` **E** (se houver prova de módulo) existe `ExamAttempt` com `passed = true`.
  - **Curso concluído** (→ certificado) = todos os módulos concluídos **E** (se houver prova final) `passed = true`. Encaixa no hook de conclusão existente em `enrollments`.
  - **Desbloqueio sequencial:** o módulo N+1 só libera quando o módulo N está concluído.
- **Consequência conhecida:** numa prova bloqueante com dissertativa, o aluno fica "aguardando correção" e só progride após o instrutor corrigir.

## Fluxo de telas

### Dashboard (instrutor/admin)
- **Aba "Provas"** no detalhe do curso (`course-detail-tabs`): lista as provas do curso (por módulo + final), com criar/editar/excluir.
- **Editor de prova** (sheet): título, descrição, nota mínima, nº de tentativas, status; questões — adicionar por tipo, enunciado, alternativas com marcação de corretas, pontos, reordenar.
- **Fila de correção**: página nova no menu (admin/instrutor) agregando as tentativas em `GRADING` de todos os cursos do instrutor. Abre a tentativa, corrige as dissertativas (pontos + feedback), finaliza. Mesmo padrão das páginas de Certificados/Vídeos.

### App do aluno (app-streaming)
- **Player de prova** no fim do módulo/curso: `radio` (SINGLE/TRUE_FALSE), `checkbox` (MULTIPLE), `textarea` (ESSAY); submete.
- Retorno: só objetivas → nota + aprovado/reprovado na hora; com dissertativa → "enviado, aguardando correção".
- Mostra tentativas usadas/restantes; refazer quando permitido e ainda não aprovado.
- **Gate visual**: próximo módulo bloqueado (cadeado) até concluir o atual (aulas + prova aprovada).

## Endpoints da API (novos — todos sob `Exam`, sem tocar em `lessons/quiz.ts`)

Gestão (admin/instrutor, com checagem de ownership do curso):
- `GET /courses/:courseId/exams` — provas do curso (módulo + final)
- `POST /courses/:courseId/exams` — cria (body: moduleId?, title, passingScore?, maxAttempts?, questions[])
- `GET /exams/:id` — prova completa (com gabarito, só privilegiado)
- `PATCH /exams/:id` — atualiza metadados/status
- `PUT /exams/:id/questions` — substitui as questões (padrão do quiz de aula)
- `DELETE /exams/:id`
- `GET /exams/grading/queue` — tentativas em `GRADING` dos cursos do instrutor
- `GET /exams/attempts/:id` — tentativa para correção (respostas + gabarito)
- `POST /exams/attempts/:id/grade` — corrige dissertativas e finaliza

Aluno (autenticado, matriculado):
- `GET /exams/:id/player` — prova sem gabarito + estado de tentativas do aluno
- `POST /exams/:id/attempts` — inicia/submete tentativa (respostas) → correção automática
- `GET /courses/:slug/progress` — estado de progressão (módulos concluídos, liberado, provas pendentes/reprovadas)

## Fora de escopo

- Não alterar `Activity` / `lessons/quiz.ts` / `QuizEditorSheet` (quiz de aula existente).
- Banco de questões reutilizável, randomização/embaralhamento, tempo limite por prova, antifraude — ficam para iterações futuras.

## Faseamento sugerido (para o plano de implementação)

1. **Schema + API de gestão**: models `Exam*`, CRUD de provas + questões (dashboard consome).
2. **Editor de prova (dashboard)**: aba "Provas" + editor de questões.
3. **Player + submissão + correção automática (app do aluno + API)**.
4. **Gate de progressão**: endpoint de progresso, desbloqueio sequencial, integração com conclusão/certificado.
5. **Correção manual (dissertativa)**: fila de correção no dashboard + fechamento da nota.

> Criado em 2026-07-09 11:51 (-03) · Última modificação: 2026-07-09 11:51 (-03)
