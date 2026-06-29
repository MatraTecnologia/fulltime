# Frontend Completo — Plataforma Full Time (Design Spec)

> Continuação do produto cujo backend (`apps/api`) está completo. Este spec desenha o **frontend completo** (`apps/web`), integrado às rotas já existentes. Stack e identidade visual derivam do spec de produto (`2026-06-27-plataforma-capacitacao-design.md`) e da fundação (`2026-06-27-fundacao.md`, Tasks 7-8).

## Contexto

Plataforma LMS de capacitação para profissionais (pedagogos, terapeutas, professores) que atuam com crianças atípicas (TEA, TDAH). Slogan: *Acolher · Desenvolver · Incluir*. UI calma, acessível (WCAG AA), navy como base (~90% das superfícies) e cores vibrantes só como acento.

**Estado atual do monorepo:**
- `apps/api` — backend completo (auth better-auth, users, courses, modules, lessons, enrollments+certificado, children+records).
- `packages/ui` (`@fulltime/ui`) — design system pronto: tokens da marca (navy `#003060`, amber `#f5b500`, green/blue/purple), fontes Nunito (display) / Inter (sans), Tailwind v4 via `@import`, componentes `Button`, `Card`, `Input`, `CategoryBadge`, helper `cn`.
- `packages/config-ts` (presets `base`/`node`/`nextjs`) e `packages/config-eslint` (flat config).
- `apps/web` — **não existe ainda**; é o que este spec/plano cria.

**Escopo deste ciclo (decisão do usuário):** plataforma **inteira** — público + auth + área do profissional (incl. módulo de crianças) + painel admin/instrutor.

## Stack (já definida na fundação)

- **Next.js 16** (App Router) + **React 19**.
- **Tailwind v4** (`@tailwindcss/postcss`), consumindo `@fulltime/ui/theme.css` + `transpilePackages: ['@fulltime/ui']`.
- **better-auth client** (`createAuthClient`) apontando para a API em `/auth`.
- `tsconfig` herda `@fulltime/config-ts/nextjs.json`; ESLint herda `@fulltime/config-eslint`.
- Package: `@fulltime/web`. Verificação: `next build` + `tsc --noEmit` + smoke manual (sem testes automatizados neste ciclo).

## Decisões arquiteturais

### 1. Renderização & sessão — **híbrida**

- **`(public)`** (landing, catálogo, página de curso) em **Server Components**: buscam `GET /courses` e `GET /courses/:slug` direto na API no server (sem auth) → SEO e first paint.
- **`(app)`** e **`(admin)`** predominantemente **Client Components**: usam o better-auth `useSession` + o fetch client (`credentials: 'include'`) para enviar o cookie de sessão.
- `src/middleware.ts` checa o cookie `better-auth.session_token` e redireciona para `/login` quem acessa rota protegida sem sessão. **A autorização real permanece no backend** (`requireAuth`/`requireRole`); o middleware é apenas UX/gate de navegação.
- Gate de role no `(admin)`: layout client lê `session.user.role`; esconde/redireciona quando não é `admin`/`instrutor`. O backend continua a fonte de verdade (403).

### 2. Acesso à API & tipos — **fetch fino + tipos manuais**

- `src/lib/api.ts`: wrapper `apiFetch` sobre `NEXT_PUBLIC_API_URL` com `credentials: 'include'`, JSON por padrão, e tratamento de erro uniforme (401 → redireciona p/ login; 4xx/5xx → erro tipado com mensagem). Em Server Components, uma variante repassa os headers/cookies da request.
- `src/lib/types.ts`: tipos TS espelhando as respostas da API (`Course`, `Module`, `Lesson`, `Attachment`, `Enrollment`, `LessonProgress`, `Certificate`, `Child`, `ChildRecord`, `User`, enums).
- **Por que não gerar do OpenAPI:** o Fastify valida apenas o **request** (JSON Schema), sem `response` schemas — o Swagger/Scalar não emite tipos de resposta confiáveis. Com ~30 endpoints, tipos manuais são mais rápidos e fiéis. Um package `@fulltime/contracts` compartilhado fica como evolução futura (exigiria exportar tipos do backend) — **fora deste ciclo**.

## Mapa de telas → endpoints

### `(public)` — sem auth (Server Components)
| Rota | Conteúdo | API |
|------|----------|-----|
| `/` | Landing institucional + cursos em destaque | `GET /courses` |
| `/cursos` | Catálogo publicado | `GET /courses` |
| `/cursos/[slug]` | Página do curso (descrição, currículo em metadados, CTA matricular/login) | `GET /courses/:slug` |

### `(auth)` — Client Components (better-auth client)
| Rota | Ação |
|------|------|
| `/login` | `signIn.email` → `/dashboard` |
| `/cadastro` | `signUp.email` → `/verificar` (role sempre `profissional`; backend impede setar role) |
| `/verificar` | Página estática: instrui checar e-mail (verificação obrigatória) |
| `/recuperar-senha` | `forget-password` |
| `/redefinir-senha?token=` | `reset-password` |

### `(app)` — profissional logado (middleware + `useSession`)
| Rota | Conteúdo | API |
|------|----------|-----|
| `/dashboard` | Matrículas em andamento, progresso, atalhos | `GET /enrollments` |
| `/aprender/[slug]` | **Player**: árvore de módulos/aulas + progresso; conteúdo/vídeo/anexos; concluir aula | `GET /courses/:slug`, `GET /enrollments/:id`, `GET /lessons/:id` (vídeo via `resolveVideo`→`embedUrl`), `POST /enrollments/:id/lessons/:lessonId/complete` |
| `/certificados` | Lista + emitir + visualizar (render no front a partir do `code`, pois `url` é null) | `GET /enrollments`, `POST /enrollments/:id/certificate`, `GET /enrollments/:id/certificate` |
| `/criancas` | Lista + criar | `GET /children`, `POST /children` |
| `/criancas/[id]` | Detalhe + records (criar/excluir) | `GET /children/:id`, `POST /children/:childId/records`, `DELETE /records/:id` |
| `/perfil` | Dados do usuário | `GET /users/me` |

Matrícula em si dispara `POST /courses/:courseId/enroll` (a partir do CTA na página pública do curso, quando logado; senão redireciona para `/login`).

### `(admin)` — admin/instrutor (guard de role; backend força `requireRole`)
| Rota | Conteúdo | API |
|------|----------|-----|
| `/admin/cursos` | Lista todos os cursos incl. DRAFT | `GET /courses?status=` |
| `/admin/cursos/novo` | Criar curso | `POST /courses` |
| `/admin/cursos/[id]` | Editar/publicar/excluir + **editor de currículo** (módulos e aulas/anexos) | `PATCH /courses/:id`, `POST /courses/:id/publish`, `DELETE /courses/:id`, `POST/PATCH/DELETE /courses/:courseId/modules`+`/modules/:id`, `POST/PATCH/DELETE /modules/:moduleId/lessons`+`/lessons/:id`, `POST/DELETE /lessons/:lessonId/attachments`+`/attachments/:id` |

## Componentes & organização

- **Genéricos faltantes → `@fulltime/ui`** (reutilizáveis, sem regra de negócio): `Label`/`Field`/`FormError`, `Select`, `Textarea`, `Checkbox`, `Sidebar`/`Topbar` (AppShell), `VideoEmbed` (iframe do `embedUrl`), `ProgressBar`, `Avatar`, `Table`, `Dialog`/`Modal`, `Tabs`, `Toast`, `EmptyState`.
- **De feature → no app** (`apps/web/src/components`): `CourseCard`, `CourseGrid`, `EnrollButton`, `LessonPlayer`, `LessonList`, `RecordForm`, `ChildCard`, `CurriculumEditor`, `ModuleEditor`, `LessonEditor`, etc.

```
apps/web/
  next.config.ts · postcss.config.mjs · tsconfig.json · eslint.config.mjs · .env.example
  src/
    app/
      layout.tsx (fontes Nunito/Inter, providers) · globals.css (importa @fulltime/ui/theme.css)
      (public)/   page.tsx · cursos/page.tsx · cursos/[slug]/page.tsx
      (auth)/     login · cadastro · verificar · recuperar-senha · redefinir-senha
      (app)/      layout.tsx (AppShell) · dashboard · aprender/[slug] · certificados · criancas · criancas/[id] · perfil
      (admin)/    layout.tsx (guard role) · cursos · cursos/novo · cursos/[id]
    lib/          auth-client.ts · api.ts · types.ts
    components/   (feature-specific)
    middleware.ts
```

## Integração auth / cookies

- Dev: API em `:3333`, web em `:3000` — origens distintas. O CORS da API já usa `credentials: true`; o `authClient` usa `baseURL: NEXT_PUBLIC_API_URL` + `basePath: '/auth'`, e o `apiFetch` usa `credentials: 'include'`.
- `requireEmailVerification: true` no backend → após `signUp.email`, o usuário **não** loga até verificar; `/verificar` orienta. `autoSignInAfterVerification: true` → ao clicar no link, já entra logado.
- Sessão de 14 dias; cookie `better-auth.session_token`. Produção: `COOKIE_DOMAIN` compartilhado entre web e API (cross-subdomain) — variável de ambiente, sem mudança de código.

## Faseamento (tasks do plano)

1. **Scaffold `apps/web`** — Next 16, Tailwind v4, `@fulltime/ui`, configs compartilhadas, `layout`/fontes, `globals.css`, landing básica. `.env.example` com `NEXT_PUBLIC_API_URL`.
2. **Camada base** — `auth-client.ts`, `api.ts` (`apiFetch` + variante server), `types.ts`, `middleware.ts`; componentes UI genéricos faltantes em `@fulltime/ui`.
3. **Auth** — login, cadastro, verificar, recuperar/redefinir senha.
4. **Público** — catálogo (`/cursos`) + página de curso (`/cursos/[slug]`) com CTA de matrícula.
5. **App shell + dashboard** — Sidebar/Topbar, user menu, logout, dashboard com matrículas.
6. **Player de aula** — `/aprender/[slug]`: currículo, conteúdo/vídeo/anexos, progresso, concluir aula, matrícula.
7. **Certificados** — lista, emissão, visualização renderizada no front.
8. **Crianças + records** — lista, criação, detalhe, records (criar/excluir).
9. **Admin: CRUD de cursos** — lista (incl. DRAFT), criar, editar, publicar, excluir.
10. **Admin: editor de currículo** — módulos + aulas + anexos.
11. **Polish** — estados loading/erro/empty, responsivo, acessibilidade AA, `next build` + `tsc` limpos + smoke manual dos fluxos.

Ordem é dependência real: 1→2 bloqueiam o resto; 3 (auth) habilita 5-10; público (4) é independente de auth; admin (9-10) depende da camada base e do editor de currículo encadeado (curso → módulo → aula).

## Fora de escopo deste ciclo

- Pagamentos, quizzes/avaliações, login social, provider de vídeo próprio (começa embed YouTube/Vimeo).
- Geração de PDF de certificado (front renderiza a partir do `code`; `url` permanece null).
- Package `@fulltime/contracts` de tipos compartilhados (tipos manuais por ora).
- Testes automatizados (E2E/component) — verificação por build + typecheck + smoke.

## Verificação

Cada task: `pnpm --filter @fulltime/web exec tsc --noEmit` limpo e, quando aplicável, `pnpm --filter @fulltime/web build` (`next build`) sem erros. Ao final, smoke manual dos fluxos críticos com a API rodando: cadastro→verificação→login; navegação pública; matrícula→assistir→concluir→certificado; CRUD admin; crianças+records.

> Criado em 2026-06-29 12:01 (-03) · Última modificação: 2026-06-29 12:01 (-03)
