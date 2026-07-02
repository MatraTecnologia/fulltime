# Redesign da autoria de cursos (admin)

## Contexto

A área admin de cursos (`/admin/cursos`) permite criar e editar cursos, mas está crua
em comparação com o resto do produto (o catálogo do aluno já usa `rounded-card`,
`shadow-card`, `ring`, `accordion`). Três limitações motivam este trabalho:

1. Não é possível **escolher o instrutor** — o criador vira instrutor automaticamente
   (`instructorId: request.session.user.id` em `courses/index.ts:110`).
2. Cada aula MUX só permite **upload novo**; vídeos já enviados (fila em
   `GET /admin/videos`) não podem ser reaproveitados.
3. A criação usa um form básico empilhado (`max-w-xl`) e o currículo empilha dialogs.

## Objetivo

Redesenhar a experiência de autoria de curso: fluxo de criação em wizard, seleção de
instrutor, biblioteca de vídeos reutilizáveis e repaginação visual fiel à identidade —
sem regredir os fluxos de publicar/excluir existentes.

## Decisões de escopo (confirmadas)

- **Instrutor**: qualquer admin ou instrutor pode selecionar qualquer instrutor.
- **Vídeo já subido**: seletor de biblioteca (lista de assets `READY` não vinculados).
- **Redesign**: admin (Fase 1) + catálogo do aluno (Fase 2).
- **Criação**: wizard em etapas. **Edição**: página única atual, repaginada.

## Arquitetura

### Fluxo de criação — wizard com rascunho progressivo

O wizard **não** pode ser um form multi-etapa client-side puro: módulos
(`POST /courses/:id/modules`), aulas (`POST /modules/:id/lessons`) e uploads Mux
(`POST /admin/videos/uploads` recebe `lessonId`; webhook liga via `asset.lessonId`)
exigem IDs persistidos. Portanto o curso é criado como `DRAFT` já na etapa 1.

- **Etapa 1 — Dados básicos**: título, descrição, capa (URL), slug, instrutor.
  Ao avançar → `POST /courses` cria o curso `DRAFT` e retorna o `id`/`slug`. As etapas
  seguintes operam com IDs reais.
- **Etapa 2 — Currículo**: CRUD de módulos e aulas com edição inline (sem dialogs
  empilhados). Cada aula permite vídeo por upload novo **ou** biblioteca.
- **Etapa 3 — Revisão & publicar**: resumo (módulos, aulas, capa, instrutor) +
  botão publicar (`POST /courses/:id/publish`, `DRAFT → PUBLISHED`).

**Abandono de rascunho**: o curso `DRAFT` permanece salvo e aparece na listagem admin
marcado como "Rascunho". É retomável ao entrar no curso (cai na página de edição, que
já contém o currículo). **Sem cleanup automático** de órfãos — decisão explícita para
manter o fluxo simples e permitir retomada.

### Edição de curso existente

Mantém a página única atual (`/admin/cursos/[slug]`): form no topo + currículo inline,
com publicar/excluir preservados. Recebe apenas a repaginação visual e o seletor de
instrutor no form. O wizard é exclusivo da criação (`/admin/cursos/novo`).

## Backend

### Alterações

- `POST /courses` (`courses/index.ts`): aceitar `instructorId` opcional no body schema
  e no handler. Se omitido, default = `request.session.user.id` (mantém compatibilidade).
- `PATCH /courses/:id`: adicionar `instructorId` ao body schema e ao `data` do update,
  permitindo trocar o instrutor após a criação.

### Novo endpoint — vincular vídeo da biblioteca

`POST /lessons/:id/video/link`

- Body: `{ videoAssetId: string }`.
- PreHandler: `requireAuth, requireRole('admin', 'instrutor')`.
- Regras:
  - Carrega o `VideoAsset`; exige `status === 'READY'` e `lessonId === null`
    (409/422 caso contrário).
  - Replica a lógica do webhook (`webhooks/index.ts:59-62`): atualiza a lesson com
    `videoSource='MUX'`, `videoRef=playbackId`, `durationSec` do asset; e seta
    `asset.lessonId = lessonId`.
  - Cardinalidade **1:1** mantida (`VideoAsset.lessonId` é singular, `types.ts:37`):
    um asset serve uma aula. **Sem re-link/move** entre aulas.
- O playback usa `playback_policies: ['signed']` — o token de reprodução deve funcionar
  para assets vinculados exatamente como para os enviados via upload (mesmo playbackId).

### Biblioteca de vídeos

`GET /admin/videos` já existe. Para o seletor, filtrar client-side (ou via query) por
`status === 'READY' && lessonId === null`. Retorno já inclui thumbnail-capaz
(`playbackId`), `filename`, `durationSec`.

## Frontend

### Componentes (Fase 1)

- `course-wizard.tsx` — orquestra as 3 etapas, com stepper visual e estado do curso
  criado. Reutiliza `CourseForm` (etapa 1) e o editor de currículo (etapa 2).
- `course-form.tsx` — adicionar seletor de instrutor (Combobox alimentado por
  `GET /users?role=instrutor`). Repaginação dos campos.
- `curriculum-editor.tsx` / `module-editor.tsx` — edição inline de módulos/aulas,
  substituindo dialogs empilhados por edição no próprio card; estados vazios ilustrados.
- `lesson-editor.tsx` — junto de "Enviar vídeo", botão "Escolher da biblioteca" que abre
  a lista de assets `READY` não vinculados (thumbnail/nome/duração) → seleciona → chama
  `POST /lessons/:id/video/link`.
- `video-library-picker.tsx` — componente de seleção (lista + preview + confirmar).
- Listagem `/admin/cursos` — cards consistentes com filtro por status.

### Identidade visual

Tokens existentes (`globals.css`): navy `#032e5b`, accent amber `#fdb509`,
`rounded-card`, `shadow-card`, `ring-brand-navy/[0.06]`, `font-display`. O catálogo do
aluno é a referência de qualidade; o admin é trazido ao mesmo padrão.

### Tipos (`lib/types.ts`)

- `CourseDetail` / `CourseListItem`: `instructor` já presente. Nenhuma mudança estrutural,
  mas o form envia `instructorId`.
- `VideoAsset` já tem os campos necessários para o picker.

## Faseamento

- **Fase 1 (núcleo, shippável)**: backend (instructorId + link endpoint) + wizard +
  seletor de instrutor + biblioteca de vídeo + redesign admin (form/currículo/listagem).
- **Fase 2 (polish)**: refinar o catálogo do aluno (página de detalhe + cards).

## Fora de escopo

- Reordenação drag-and-drop de módulos/aulas (a menos que já exista).
- Re-link de um asset entre aulas (exigiria mudança de cardinalidade).
- Cleanup automático de rascunhos abandonados.
- Upload de capa (segue como URL).

## Riscos / verificações

- Confirmar que o signed playback token funciona para assets vinculados via novo endpoint
  (mesmo caminho de `playbackId` do upload).
- Garantir que a repaginação da página de edição não regride publicar/excluir.
- Wizard deve tolerar refresh/navegação: como o curso é persistido em `DRAFT` desde a
  etapa 1, um refresh cai na edição do rascunho sem perda de dados.

> Criado em 2026-07-02 11:58 (-03) · Última modificação: 2026-07-02 11:58 (-03)
