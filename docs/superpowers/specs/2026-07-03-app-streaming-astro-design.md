# app-streaming (Astro) — plataforma de streaming + login

## Objetivo

Construir o `apps/app-streaming` como a **plataforma de streaming do aluno** em **Astro**, fiel aos designs de `design/plataforma-geral`:

1. **Login/cadastro** (Better Auth, plugando UI contra a API que já existe).
2. **Home / Catálogo** — a experiência de quem assiste às aulas (design imagem 1).
3. **Player de aula** — carregamento e reprodução de vídeo (Mux) com sidebar, abas e notas (design imagem 2).

Entrega focada. `apps/web` (Next) segue de pé até paridade, aí é aposentado.

## Decisões travadas (brainstorming)

- **Stack:** tudo em **Astro** (modo `server`/SSR + adapter Node). Interatividade via **React islands**; player Mux reescrito como island. O scaffold Astro atual (`index.astro`) é descartado.
- **Better Auth já está 100% no `apps/api`** (Fastify + Prisma adapter, `crossSubDomainCookies`, roles `admin|instrutor|profissional`, e-mail/verificação/reset). Aqui só criamos a **UI de login** e apontamos o client — **não é setup de backend**.
- **Design system:** **reusar `@fulltime/ui`** — ele já expõe `theme.css` (Tailwind 4 `@theme` com as cores da logo) importável como CSS puro nos `.astro`, **e** os primitivos React (Button, Card, Input, Tabs, VideoEmbed/Mux, Spinner, ProgressBar…) usados **dentro** dos islands. Sem novo pacote (DRY). **Light-only.**
- **Tipografia (design `plataforma-geral`):** headings **`'Plus Jakarta Sans'`**, textos **`'Inter'`** — override de `--font-display` no `globals.css` do `app-streaming` (o `theme.css` traz Nunito por padrão).
- **Migração incremental:** `apps/web` continua servindo; `app-streaming` cresce em paralelo até paridade.
- **Fora agora (YAGNI):** área da criança / link tokenizado (vira projeto separado no futuro), site de marketing separado, dashboard e dashboard-admin (specs próprios depois), dark mode.
- **Rota do player:** `/aprender/[slug]` (igual ao web).
- Seções sem dado na API (eventos/webinários, plano de estudos semanal, depoimentos, trilhas) entram como **placeholder visual** explícito — sem inventar backend.

## Cores da marca

| Papel | Hex |
|---|---|
| Navy (estrutura/texto) | `#032E5B` |
| Amber (destaque primário) | `#FDB509` |
| Verde | `#6BA93C` |
| Azul | `#0D92E1` |
| Roxo | `#8649A5` |
| Branco (base) | `#FDFCFF` |

## Estado atual (levantado no código)

- Monorepo turbo + pnpm. `apps/web` (Next 16, todo o streaming já construído: `catalogo`, `aprender/[slug]`, player Mux, `@fulltime/ui`, `better-auth/react`). `apps/api` (Fastify 5, Prisma 7, Better Auth, Resend, Mux). `packages/ui` (React).
- `apps/app-streaming` = scaffold Astro 7 vazio (`src/pages/index.astro`).
- **API disponível e reutilizável tal como está:**
  - `GET /courses`, `GET /courses/:slug` — catálogo e detalhe.
  - `GET /lessons/:id` — conteúdo da aula (inclui link de vídeo Mux via `POST /lessons/:id/video/link`).
  - `POST /courses/:courseId/enroll`, `GET /enrollments`, `GET /enrollments/:id`, `POST /enrollments/:id/lessons/:lessonId/complete` — matrícula e progresso.
  - `GET /users/me` — usuário logado.
  - Better Auth em `/auth/*` (sign-in/up, verify, reset, get-session).
- **Sem endpoint (→ placeholder):** eventos/webinários, plano de estudos semanal, depoimentos, agrupamento por "trilha".

---

## Arquitetura

### Frente 0 — Fundação de design (reuso, não novo pacote)

`@fulltime/ui` já é o ponto de verdade da identidade:
- `@fulltime/ui/theme.css` — Tailwind 4 `@theme` com cores da marca, espaçamento, raio e sombras. Importado no `globals.css` do `app-streaming` → tokens disponíveis nos `.astro`.
- Primitivos React (`Button`, `Card`, `Input`, `Tabs`, `VideoEmbed`, `Spinner`, `ProgressBar`, `StatCard`…) reusados dentro dos islands.
- **Tipografia do `plataforma-geral` (override):** headings `'Plus Jakarta Sans'`, textos `'Inter'`. O `theme.css` usa Nunito em `--font-display`; o `globals.css` do `app-streaming` **sobrescreve** `--font-display: 'Plus Jakarta Sans'` e mantém `--font-sans: 'Inter'`, carregando ambas as fontes (via `@fontsource` ou `<link>` Google Fonts).
- Light-only, contraste AA sobre base branca.

**Interface:** nenhuma mudança na assinatura pública de `@fulltime/ui`; `app-streaming` só consome e sobrescreve a fonte de display localmente. Zero duplicação de design system.

### Frente 1 — Fundação Astro

`apps/app-streaming` reconfigurado:
- `astro.config.mjs`: `output: 'server'`, adapter **Node**, integrações **`@astrojs/react`** e **Tailwind 4** (`@tailwindcss/vite`).
- `package.json`: dependências `astro`, `@astrojs/react`, `@astrojs/node`, `react`, `react-dom`, `@mux/mux-player-react`, `better-auth`, `@fulltime/ui`, `tailwindcss`, `@fontsource/plus-jakarta-sans`, `@fontsource/inter`.
- `src/lib/api.ts` — equivalente Astro do `apiFetch`/`apiServer`: no server (frontmatter/middleware) encaminha o cookie de sessão; nos islands usa fetch com credenciais.
- `src/lib/auth-client.ts` — `createAuthClient({ baseURL: API_URL, basePath: '/auth' })` (variante vanilla/react).

**Interface:** cada página `.astro` busca dados no server e passa como props para os islands; islands só recebem dados serializáveis + fazem mutações via API.

### Frente 2 — Autenticação (plugar UI)

- **Middleware** `src/middleware.ts`: para rotas protegidas, valida sessão chamando a API (`/auth/get-session`) com o cookie; sem sessão → redireciona `/login?next=…`.
- **Páginas de auth** (islands React com formulários): `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/verificar` — espelham os fluxos já existentes no `apps/web/(auth)`, usando `better-auth/client`.
- **Ajuste na API** (`apps/api/src/lib/auth.ts` / env): incluir a origem do `app-streaming` em `trustedOrigins`; documentar `COOKIE_DOMAIN` para sessão cross-subdomain em produção.
- Pós-login: `profissional` vai para a home de streaming (`/`). Roteamento para outros papéis/apps fica para os specs de dashboard.

**Segurança:** toda checagem de sessão é server-side (middleware); islands nunca decidem acesso. Cookies `httpOnly` do Better Auth; nada de token em `localStorage`.

### Frente 3 — Home / Catálogo (design imagem 1)

Rota `/` (protegida). Layout com `AppHeader` (logo, nav, busca, sino, avatar) e as seções, cada uma como componente `.astro` recebendo dados do server; interatividade pontual em islands:

- **Hero "Em destaque"** — carrossel (island Embla) de cursos publicados.
- **Continue de onde parou** — cards de matrículas em progresso (`GET /enrollments`), com `%` e botão continuar (island para o carrossel).
- **Trilhas de aprendizagem** — 4 "mundos" nas cores da logo. *Placeholder* (sem modelo de trilha na API) — derivado por categoria ou mock, marcado como tal.
- **Formações em destaque** — grade de `GET /courses`.
- **Categorias** / **Recomendados** — a partir de cursos; recomendados = heurística simples client-side ou mock.
- **Plano de estudos da semana**, **Próximos eventos/webinários**, **Professores destaque**, **Certificações e benefícios**, **Depoimentos**, faixa de **estatísticas**, **Últimos conteúdos**, **FAQ**, **Footer** — *placeholders visuais* fiéis ao design onde não há dado.

**Interface:** `src/pages/index.astro` compõe seções; cada seção é isolada e testável com props mockáveis.

### Frente 4 — Player de aula (design imagem 2)

Rota `/aprender/[slug]` (protegida). Server busca curso + módulos/aulas + matrícula/progresso; passa para:

- **Sidebar de módulos/aulas** — lista com progresso, aula ativa, cadeado (`.astro` + island para expandir/selecionar).
- **Player central** — **island `LessonPlayer`** (`@mux/mux-player-react`): busca/link do vídeo Mux, controla reprodução, **reporta progresso** e chama `POST /enrollments/:id/lessons/:lessonId/complete` ao concluir.
- **Abas** Sobre / Transcrição / Materiais / Atividades / Comentários — island com estado de aba; Materiais lista anexos (`attachments`); Sobre traz descrição + instrutor; demais abas com dado real quando existir, senão placeholder.
- **Painel lateral** — **Notas** (island; persistência: local por enquanto se não houver endpoint, marcado como placeholder), **Recursos** (anexos com download), **Precisa de ajuda?**, **Próxima aula**.

**Interface:** `LessonPlayer` recebe `{ lessonId, enrollmentId, playbackToken }` e emite conclusão via API; o resto do player é casca `.astro`.

---

## Fluxo de dados

- **Server (Astro frontmatter + middleware):** encaminha cookie de sessão Better Auth para a API; busca dados iniciais (cursos, matrículas, aula).
- **Islands (client):** hidratam com props do server; mutações (progresso, matrícula, notas, auth) via `fetch` com `credentials: 'include'` para a API.
- Autorização e sessão sempre resolvidas no server a partir do cookie.

## Tratamento de erros

- API: padrão atual (`4xx` com `{ error }`).
- Astro: estados de loading (skeleton), erro (`role="alert"`), vazio (Empty) nas seções e no player.
- Auth: mensagens amigáveis de credencial inválida / e-mail não verificado / token expirado.
- Placeholders nunca simulam erro — renderizam conteúdo estático fiel ao design.

## Testes / verificação

- **Auth:** login válido → home; sem sessão em rota protegida → redirect `/login`; cadastro → e-mail de verificação; reset de senha.
- **Catálogo:** home carrega cursos reais; "continuar" reflete progresso real; placeholders renderizam sem quebrar.
- **Player:** carrega vídeo Mux real, reprodução funciona, concluir aula persiste (`POST .../complete`) e atualiza progresso.
- **SSR/build:** `astro build` limpo com adapter Node; middleware protege as rotas certas.
- **Identidade:** cores/tipografia da marca aplicadas via `ui-tokens` em `.astro` e islands.

## Fora de escopo (YAGNI)

- Área da criança / link tokenizado (projeto separado futuro).
- Site de marketing separado.
- `apps/dashboard` e `apps/dashboard-admin` (specs próprios).
- Dark mode.
- Novos endpoints de backend (eventos, plano de estudos, notas persistidas, trilhas) — placeholder por ora; viram spec quando priorizados.
- Aposentar `apps/web` (só quando houver paridade).

## Ordem de execução (por dependência)

1. **Fundação Astro** (config server/Node, React, Tailwind, `globals.css` reusando `@fulltime/ui/theme.css` + override de fonte Plus Jakarta Sans/Inter, `api.ts`, `auth-client.ts`).
2. **Autenticação** (middleware + páginas de auth + ajuste `trustedOrigins`).
3. **Home / Catálogo** (seções sobre a fundação; dados reais + placeholders).
4. **Player de aula** (`LessonPlayer` island + sidebar + abas + notas).

> Criado em 2026-07-03 15:58 (-03) · Última modificação: 2026-07-03 16:05 (-03)
