# app-streaming (Astro) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `apps/app-streaming` em Astro como a plataforma de streaming do aluno (login + home/catálogo + player de aula), fiel a `design/plataforma-geral`, consumindo a API Fastify já existente.

**Architecture:** Astro 7 em `output: 'server'` (adapter Node standalone). Casca estática em `.astro`, interatividade em React islands (`@astrojs/react`). Sessão validada no server via middleware contra o Better Auth já existente na `apps/api`. Design system reusa `@fulltime/ui` (tokens CSS + primitivos React); tipografia sobrescrita para Plus Jakarta Sans (headings) / Inter (texto).

**Tech Stack:** Astro 7, `@astrojs/node`, `@astrojs/react`, React 19, Tailwind 4 (`@tailwindcss/vite`), `@mux/mux-player-react`, `better-auth`, `@fulltime/ui`, `@fontsource/plus-jakarta-sans`, `@fontsource/inter`.

## Global Constraints

- **Node 22+**; pnpm workspace (já configurado; `apps/*` já no `pnpm-workspace.yaml`).
- **Astro `output: 'server'`** + `@astrojs/node` mode `standalone`. Nunca modo estático (conteúdo é atrás de login).
- **Light-only.** Sem dark mode.
- **Tipografia:** headings `'Plus Jakarta Sans'` (`--font-display`), texto `'Inter'` (`--font-sans`). Classes: `font-display` para títulos, `font-sans` (default) para texto.
- **Cores da marca** via `@fulltime/ui/theme.css` (`brand-navy #032e5b`, `brand-amber #fdb509`, `brand-green #6ba93c`, `brand-blue #0d92e1`, `brand-purple #8649a5`, base `#fdfcff`). Usar classes `text-brand-navy`, `bg-brand-amber`, etc.
- **API base:** server usa `import.meta.env.API_URL ?? 'http://localhost:3333'`; client/islands usam `import.meta.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'`.
- **Better Auth já existe na API** (`/auth/*`). NÃO reimplementar backend de auth. Apenas UI + client + `trustedOrigins`.
- **Reusar `@fulltime/ui`**; não duplicar primitivos. Componentes React só dentro de islands.
- **Sem `console.log`** em código entregue. `const` arrow functions. Sem comentários em código não modificado.
- **Placeholders explícitos** (eventos, trilhas, plano de estudos, depoimentos, notas persistidas) — conteúdo estático fiel ao design, comentado como placeholder no topo do componente.
- **Rota do player:** `/aprender/[slug]`.
- **Commits específicos por arquivo** (nunca `git add -A`/`.`). Terminar mensagem de commit com `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

### Task 1: Fundação Astro (config, deps, layout base, fontes, tokens)

Reconfigura o scaffold Astro para SSR com React + Tailwind 4, importando os tokens de `@fulltime/ui` e as fontes do design. Entrega: `astro dev` renderiza uma página base estilizada com as cores/fontes da marca; `astro build` limpo.

**Files:**
- Modify: `apps/app-streaming/package.json`
- Modify: `apps/app-streaming/astro.config.mjs`
- Modify: `apps/app-streaming/tsconfig.json`
- Create: `apps/app-streaming/src/styles/globals.css`
- Create: `apps/app-streaming/src/layouts/BaseLayout.astro`
- Modify: `apps/app-streaming/src/pages/index.astro` (placeholder temporário de smoke test)
- Delete: `apps/app-streaming/package-lock.json` (o monorepo usa pnpm)

**Interfaces:**
- Produces: `BaseLayout.astro` com prop `{ title: string }` e `<slot />`; importa `globals.css`. Todas as páginas futuras usam este layout.

- [ ] **Step 1: Substituir `package.json`**

```json
{
  "name": "app-streaming",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/node": "^9.0.0",
    "@astrojs/react": "^4.0.0",
    "@fontsource/inter": "^5.0.0",
    "@fontsource/plus-jakarta-sans": "^5.0.0",
    "@fulltime/ui": "workspace:*",
    "@mux/mux-player-react": "^3.13.0",
    "astro": "^7.0.6",
    "better-auth": "^1.6.22",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@fulltime/config-ts": "workspace:*",
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Remover o lockfile npm e instalar via pnpm**

```bash
rm -f apps/app-streaming/package-lock.json
pnpm install
```

Verificar as versões resolvidas de `@astrojs/node`/`@astrojs/react` compatíveis com `astro@7`. Se `pnpm install` acusar peer incompatível, ajustar a faixa (`@astrojs/node`/`@astrojs/react`) para a major compatível com Astro 7 informada no erro e reinstalar.

- [ ] **Step 3: Reescrever `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
```

- [ ] **Step 4: `tsconfig.json` estende a config compartilhada e habilita JSX**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: `src/styles/globals.css` — tokens + override de fonte**

```css
@import "@fulltime/ui/theme.css";
@import "@fontsource/plus-jakarta-sans/400.css";
@import "@fontsource/plus-jakarta-sans/600.css";
@import "@fontsource/plus-jakarta-sans/700.css";
@import "@fontsource/plus-jakarta-sans/800.css";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";

@theme {
  --font-display: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

html {
  font-family: var(--font-sans);
  color: var(--color-brand-navy);
  background: var(--color-white);
}
```

- [ ] **Step 6: `src/layouts/BaseLayout.astro`**

```astro
---
import "@/styles/globals.css"
interface Props { title: string }
const { title } = Astro.props
---
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body class="min-h-screen bg-white text-brand-navy antialiased">
    <slot />
  </body>
</html>
```

- [ ] **Step 7: `src/pages/index.astro` — smoke test temporário**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro"
---
<BaseLayout title="Full Time — Streaming">
  <main class="mx-auto max-w-3xl px-6 py-20">
    <h1 class="font-display text-4xl font-extrabold text-brand-navy">Full Time</h1>
    <p class="mt-4 text-brand-blue">Fundação Astro pronta.</p>
    <button class="mt-6 rounded-pill bg-brand-amber px-6 py-3 font-semibold text-brand-navy">
      Botão de teste
    </button>
  </main>
</BaseLayout>
```

- [ ] **Step 8: Rodar o dev server e verificar render**

Run: `pnpm --filter app-streaming dev`
Expected: sobe em `http://localhost:4321`; a página mostra "Full Time" em Plus Jakarta Sans (heading), texto azul, botão âmbar arredondado. Sem erro no console do Astro.

- [ ] **Step 9: Verificar build de produção**

Run: `pnpm --filter app-streaming build`
Expected: build conclui sem erro; gera `dist/server/` (modo server/Node).

- [ ] **Step 10: Commit**

```bash
git add apps/app-streaming/package.json apps/app-streaming/astro.config.mjs apps/app-streaming/tsconfig.json apps/app-streaming/src/styles/globals.css apps/app-streaming/src/layouts/BaseLayout.astro apps/app-streaming/src/pages/index.astro pnpm-lock.yaml
git rm --cached apps/app-streaming/package-lock.json 2>/dev/null || true
git commit -m "feat(app-streaming): fundação astro (ssr node, react, tailwind, tokens @fulltime/ui, fontes)"
```

---

### Task 2: Camada de dados e client de auth (`api.ts`, `auth-client.ts`, tipos)

Cria os helpers de fetch (server encaminha cookie; client usa credenciais) e o client Better Auth para islands. Entrega: helpers tipados prontos para as páginas e islands.

**Files:**
- Create: `apps/app-streaming/src/lib/api.ts`
- Create: `apps/app-streaming/src/lib/auth-client.ts`
- Create: `apps/app-streaming/src/lib/types.ts`
- Create: `apps/app-streaming/src/env.d.ts`

**Interfaces:**
- Produces:
  - `apiServer<T>(path: string, cookie: string | null, init?: RequestInit): Promise<T>` — fetch server-side com header `cookie`.
  - `apiClient<T>(path: string, init?: RequestInit): Promise<T>` — fetch client-side com `credentials: 'include'`.
  - `ApiError extends Error { status: number; body: unknown }`.
  - `authClient` (de `better-auth/react`) + `signIn, signUp, signOut, useSession`.
  - Tipos: `CourseListItem`, `CourseDetail`, `ModuleWithLessons`, `LessonSummary`, `Lesson`, `Attachment`, `EnrollmentListItem`, `EnrollmentDetail`, `LessonProgress`, `User`, `VideoSource`.

- [ ] **Step 1: `src/env.d.ts` — tipar variáveis de ambiente**

```ts
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly API_URL?: string
  readonly NEXT_PUBLIC_API_URL?: string
}
interface ImportMeta { readonly env: ImportMetaEnv }
```

- [ ] **Step 2: `src/lib/types.ts` — portar os tipos usados no streaming**

Copiar do `apps/web/src/lib/types.ts` APENAS os tipos do fluxo de streaming (sem child/admin):

```ts
export type Role = 'admin' | 'instrutor' | 'profissional'
export type CourseStatus = 'DRAFT' | 'PUBLISHED'
export type VideoSource = 'MUX' | 'YOUTUBE' | 'VIMEO' | 'NONE'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type User = { id: string; name: string; email: string; role: Role; image: string | null }

export type CourseListItem = {
  id: string; slug: string; title: string; description: string | null
  coverImage: string | null; status: CourseStatus; createdAt: string
  instructor: { id: string; name: string }
  _count: { modules: number }
}

export type LessonSummary = { id: string; title: string; order: number; durationSec: number | null }
export type ModuleWithLessons = { id: string; title: string; order: number; lessons: LessonSummary[] }
export type CourseDetail = {
  id: string; slug: string; title: string; description: string | null
  coverImage: string | null; status: CourseStatus
  instructor: { id: string; name: string }
  modules: ModuleWithLessons[]
}

export type Attachment = { id: string; name: string; url: string; type: string | null }
export type Lesson = {
  id: string; moduleId: string; title: string; order: number; content: string | null
  videoSource: VideoSource; videoRef: string | null; durationSec: number | null
  attachments: Attachment[]
  video: { source: VideoSource; embedUrl: string | null; playbackId: string | null; token: string | null }
}

export type Enrollment = { id: string; userId: string; courseId: string; status: EnrollmentStatus; enrolledAt: string }
export type EnrollmentListItem = Enrollment & {
  course: { id: string; slug: string; title: string; coverImage: string | null }
  progressCount: number; totalLessons: number
}
export type LessonProgress = { id: string; lessonId: string; completedAt: string; lesson: { id: string; title: string; order: number } }
export type EnrollmentDetail = Enrollment & { progress: LessonProgress[]; certificate: unknown | null }
```

- [ ] **Step 3: `src/lib/api.ts`**

```ts
const SERVER_BASE = import.meta.env.API_URL ?? 'http://localhost:3333'
const CLIENT_BASE = import.meta.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    const msg = typeof body === 'object' && body && 'error' in body
      ? String((body as { error: unknown }).error)
      : `HTTP ${status}`
    super(msg)
    this.status = status
    this.body = body
  }
}

const parse = async <T>(res: Response): Promise<T> => {
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

export const apiServer = async <T>(path: string, cookie: string | null, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${SERVER_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      ...(init?.headers as Record<string, string>),
    },
  })
  return parse<T>(res)
}

export const apiClient = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${CLIENT_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers as Record<string, string>),
    },
  })
  return parse<T>(res)
}
```

- [ ] **Step 4: `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  basePath: '/auth',
})

export const { signIn, signUp, signOut, useSession } = authClient
```

- [ ] **Step 5: Verificar type-check**

Run: `pnpm --filter app-streaming exec astro check`
Expected: 0 errors (pode haver 0 warnings; nenhum erro de tipo nos arquivos criados).

- [ ] **Step 6: Commit**

```bash
git add apps/app-streaming/src/lib/api.ts apps/app-streaming/src/lib/auth-client.ts apps/app-streaming/src/lib/types.ts apps/app-streaming/src/env.d.ts
git commit -m "feat(app-streaming): camada de dados (api server/client) e auth-client"
```

---

### Task 3: Middleware de sessão + `trustedOrigins` na API

Protege as rotas de streaming validando a sessão no server; libera a origem do app-streaming na API. Entrega: rota protegida sem sessão redireciona para `/login?next=…`; com sessão, segue e expõe o usuário em `Astro.locals`.

**Files:**
- Create: `apps/app-streaming/src/middleware.ts`
- Modify: `apps/app-streaming/src/env.d.ts` (tipar `Astro.locals`)
- Modify: `apps/api/src/lib/auth.ts` (trustedOrigins)
- Modify: `apps/api/.env.example` (documentar origem + COOKIE_DOMAIN)

**Interfaces:**
- Consumes: `apiServer` (Task 2).
- Produces: `Astro.locals.user: { id, name, email, role, image } | null`. Páginas protegidas leem `Astro.locals.user`.

- [ ] **Step 1: Tipar `Astro.locals` em `src/env.d.ts`**

Adicionar ao arquivo existente:

```ts
declare namespace App {
  interface Locals {
    user: { id: string; name: string; email: string; role: string; image: string | null } | null
  }
}
```

- [ ] **Step 2: `src/middleware.ts`**

Rotas públicas: `/login`, `/cadastro`, `/recuperar-senha`, `/redefinir-senha`, `/verificar`, e assets. Resto exige sessão.

```ts
import { defineMiddleware } from 'astro:middleware'

const PUBLIC_PATHS = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/verificar']
const API_BASE = import.meta.env.API_URL ?? 'http://localhost:3333'

const isPublic = (pathname: string) =>
  PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url
  const cookie = context.request.headers.get('cookie')

  let user: App.Locals['user'] = null
  if (cookie) {
    const res = await fetch(`${API_BASE}/auth/get-session`, { headers: { cookie } })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      user = data?.user ?? null
    }
  }
  context.locals.user = user

  if (!user && !isPublic(pathname)) {
    const next = encodeURIComponent(pathname + context.url.search)
    return context.redirect(`/login?next=${next}`)
  }
  if (user && isPublic(pathname)) {
    return context.redirect('/')
  }
  return next()
})
```

- [ ] **Step 3: Adicionar a origem do app-streaming em `trustedOrigins` (API)**

Em `apps/api/src/lib/auth.ts`, trocar a linha do `trustedOrigins`:

```ts
const streamingUrl = process.env.STREAMING_URL ?? 'http://localhost:4321'

// ... dentro de betterAuth({ ... }):
  trustedOrigins: [
    frontendUrl,
    streamingUrl,
    process.env.BETTER_AUTH_URL ?? 'http://localhost:3333',
  ],
```

(Declarar `streamingUrl` junto de `frontendUrl` no topo do arquivo.)

- [ ] **Step 4: Documentar env na API**

Em `apps/api/.env.example`, adicionar:

```
STREAMING_URL=http://localhost:4321
COOKIE_DOMAIN=
```

- [ ] **Step 5: Verificar redirect sem sessão**

Run: `pnpm --filter app-streaming dev` (API rodando em `:3333`)
Manual: abrir `http://localhost:4321/` sem cookie de sessão → redireciona para `/login?next=%2F`. Abrir `/login` → renderiza (Task 4 ainda não feita; página 404/placeholder aceitável aqui, o que importa é o redirect ocorrer).
Expected: `/` redireciona; `/login` NÃO redireciona.

- [ ] **Step 6: Commit**

```bash
git add apps/app-streaming/src/middleware.ts apps/app-streaming/src/env.d.ts apps/api/src/lib/auth.ts apps/api/.env.example
git commit -m "feat(app-streaming): middleware de sessão + trustedOrigins da api"
```

---

### Task 4: Páginas de autenticação (login, cadastro, recuperação, verificação)

Cria as páginas de auth como `.astro` públicas envolvendo islands React de formulário, usando `better-auth/react`. Entrega: login funcional contra a API, com redirect para `next`.

**Files:**
- Create: `apps/app-streaming/src/layouts/AuthLayout.astro`
- Create: `apps/app-streaming/src/components/auth/LoginForm.tsx` (island)
- Create: `apps/app-streaming/src/components/auth/SignupForm.tsx` (island)
- Create: `apps/app-streaming/src/components/auth/ForgotPasswordForm.tsx` (island)
- Create: `apps/app-streaming/src/components/auth/ResetPasswordForm.tsx` (island)
- Create: `apps/app-streaming/src/components/auth/VerifyNotice.tsx` (island)
- Create: `apps/app-streaming/src/pages/login.astro`
- Create: `apps/app-streaming/src/pages/cadastro.astro`
- Create: `apps/app-streaming/src/pages/recuperar-senha.astro`
- Create: `apps/app-streaming/src/pages/redefinir-senha.astro`
- Create: `apps/app-streaming/src/pages/verificar.astro`

**Interfaces:**
- Consumes: `authClient`, `signIn`, `signUp` (Task 2); primitivos `Button`, `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Input`, `Label` de `@fulltime/ui`.
- Produces: nada consumido por tasks posteriores (folha).

- [ ] **Step 1: `AuthLayout.astro` — casca centrada com logo**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro"
interface Props { title: string }
const { title } = Astro.props
---
<BaseLayout title={title}>
  <main class="flex min-h-screen items-center justify-center bg-surface px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <span class="font-display text-2xl font-extrabold text-brand-navy">Full <span class="text-brand-blue">Time</span></span>
      </div>
      <slot />
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 2: `LoginForm.tsx` island (portado do web, sem next/navigation)**

```tsx
import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { signIn, authClient } from '@/lib/auth-client'

const safeNext = () => {
  const raw = new URLSearchParams(window.location.search).get('next')
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/'
  return raw
}

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [resending, setResending] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setUnverified(false)
    const { error } = await signIn.email({ email, password })
    setLoading(false)
    if (error) {
      if (error.status === 403) {
        setUnverified(true)
        setError('Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada ou reenvie o link abaixo.')
      } else {
        setError(error.message ?? 'Falha no login.')
      }
      return
    }
    window.location.assign(safeNext())
  }

  const onResend = async () => {
    setResending(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/' })
    setResending(false)
    setError(error ? 'Não foi possível reenviar agora. Tente novamente em instantes.' : 'E-mail reenviado. Confira sua caixa de entrada (e o spam).')
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Entrar</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div role="alert" className="space-y-1">
              <p className="text-sm text-brand-navy/80">{error}</p>
              {unverified && (
                <button type="button" onClick={onResend} disabled={resending} className="text-sm text-brand-blue underline disabled:opacity-60">
                  {resending ? 'Reenviando…' : 'Reenviar e-mail de verificação'}
                </button>
              )}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <a href="/cadastro" className="hover:underline">Criar conta</a>
          <a href="/recuperar-senha" className="hover:underline">Esqueci a senha</a>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: `SignupForm.tsx` island**

```tsx
import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { signUp } from '@/lib/auth-client'

export const SignupForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUp.email({ name, email, password, callbackURL: '/' })
    setLoading(false)
    if (error) { setError(error.message ?? 'Não foi possível criar a conta.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-xl">Confirme seu e-mail</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-brand-navy/80">Enviamos um link de verificação para <strong>{email}</strong>. Abra-o para ativar sua conta.</p>
          <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Voltar para o login</a>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Criar conta</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
          {error && <p role="alert" className="text-sm text-brand-navy/80">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Criando…' : 'Criar conta'}
          </Button>
        </form>
        <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Já tenho conta</a>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: `ForgotPasswordForm.tsx` island**

```tsx
import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { authClient } from '@/lib/auth-client'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await authClient.requestPasswordReset({ email, redirectTo: '/redefinir-senha' })
    setLoading(false)
    setSent(true)
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Recuperar senha</CardTitle></CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm text-brand-navy/80">Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
              {loading ? 'Enviando…' : 'Enviar link'}
            </Button>
          </form>
        )}
        <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Voltar para o login</a>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: `ResetPasswordForm.tsx` island** (lê `token` da query)

```tsx
import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { authClient } from '@/lib/auth-client'

export const ResetPasswordForm = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = new URLSearchParams(window.location.search).get('token') ?? ''
    setLoading(true); setError('')
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)
    if (error) { setError(error.message ?? 'Link inválido ou expirado.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-xl">Senha redefinida</CardTitle></CardHeader>
        <CardContent><a href="/login" className="text-sm text-brand-blue underline">Entrar com a nova senha</a></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Nova senha</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="password">Nova senha</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
          {error && <p role="alert" className="text-sm text-brand-navy/80">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Salvando…' : 'Redefinir senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 6: `VerifyNotice.tsx` island** (aviso pós-cadastro / reenvio)

```tsx
import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { authClient } from '@/lib/auth-client'

export const VerifyNotice = () => {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const onResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/' })
    setLoading(false)
    setMsg(error ? 'Não foi possível reenviar agora.' : 'E-mail de verificação reenviado.')
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Verifique seu e-mail</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-brand-navy/80">Confirme seu e-mail pelo link que enviamos. Não recebeu? Reenvie abaixo.</p>
        <form onSubmit={onResend} className="mt-4 space-y-3">
          <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Reenviando…' : 'Reenviar e-mail'}
          </Button>
          {msg && <p className="text-sm text-brand-navy/80">{msg}</p>}
        </form>
        <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Voltar para o login</a>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 7: Páginas `.astro` montando os islands** (`client:load`)

`src/pages/login.astro`:
```astro
---
import AuthLayout from "@/layouts/AuthLayout.astro"
import { LoginForm } from "@/components/auth/LoginForm.tsx"
---
<AuthLayout title="Entrar — Full Time"><LoginForm client:load /></AuthLayout>
```

Criar de forma análoga: `cadastro.astro` (`SignupForm`), `recuperar-senha.astro` (`ForgotPasswordForm`), `redefinir-senha.astro` (`ResetPasswordForm`), `verificar.astro` (`VerifyNotice`), cada um com o `title` adequado.

- [ ] **Step 8: Verificar login end-to-end**

Run: API em `:3333` + `pnpm --filter app-streaming dev`
Manual: com um usuário verificado existente, abrir `/login`, entrar → redireciona para `/` (ou `next`). Credencial errada → mensagem de erro. `/cadastro` cria conta e mostra aviso de verificação.
Expected: login bem-sucedido redireciona; usuário logado em `/login` é mandado para `/` (middleware da Task 3).

- [ ] **Step 9: Commit**

```bash
git add apps/app-streaming/src/layouts/AuthLayout.astro apps/app-streaming/src/components/auth/ apps/app-streaming/src/pages/login.astro apps/app-streaming/src/pages/cadastro.astro apps/app-streaming/src/pages/recuperar-senha.astro apps/app-streaming/src/pages/redefinir-senha.astro apps/app-streaming/src/pages/verificar.astro
git commit -m "feat(app-streaming): páginas de autenticação (login, cadastro, recuperação, verificação)"
```

---

### Task 5: App shell (header + layout logado)

Cria o cabeçalho e o layout das telas logadas, fiéis ao design (logo, nav, busca, sino, avatar com menu/sair). Entrega: layout logado reutilizável com header funcional.

**Files:**
- Create: `apps/app-streaming/src/components/app/AppHeader.tsx` (island)
- Create: `apps/app-streaming/src/layouts/AppLayout.astro`

**Interfaces:**
- Consumes: `Astro.locals.user` (Task 3); `signOut` (Task 2); `Avatar` de `@fulltime/ui`.
- Produces: `AppLayout.astro` com props `{ title: string; user: App.Locals['user'] }` e `<slot />`. Home e Player usam este layout.

- [ ] **Step 1: `AppHeader.tsx` island**

Nav do design (imagem 1): Início, Formações, Trilhas, Categorias, Eventos, Certificações; busca; sino; avatar com "Sair".

```tsx
import { useState } from 'react'
import { Avatar } from '@fulltime/ui'
import { signOut } from '@/lib/auth-client'

interface Props { user: { name: string; image: string | null; role: string } | null }
const NAV = ['Início', 'Formações', 'Trilhas', 'Categorias', 'Eventos', 'Certificações']

export const AppHeader = ({ user }: Props) => {
  const [open, setOpen] = useState(false)
  const onSignOut = async () => { await signOut(); window.location.assign('/login') }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <a href="/" className="font-display text-xl font-extrabold text-brand-navy">Full <span className="text-brand-blue">Time</span></a>
        <nav className="hidden items-center gap-5 text-sm font-medium text-brand-navy/70 lg:flex">
          {NAV.map(item => <a key={item} href="/" className="hover:text-brand-navy">{item}</a>)}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <input placeholder="Procurar conteúdo…" className="hidden w-64 rounded-pill border border-hairline bg-surface px-4 py-2 text-sm md:block" />
          <button aria-label="Notificações" className="text-brand-navy/60 hover:text-brand-navy">🔔</button>
          <div className="relative">
            <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2">
              <Avatar src={user?.image ?? undefined} name={user?.name ?? 'Usuário'} className="size-9" />
              <span className="hidden text-sm text-brand-navy sm:block">{user?.name?.split(' ')[0]}</span>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-card border border-hairline bg-white p-1 shadow-card">
                <a href="/perfil" className="block rounded-md px-3 py-2 text-sm hover:bg-surface">Perfil</a>
                <button onClick={onSignOut} className="block w-full rounded-md px-3 py-2 text-left text-sm text-brand-navy hover:bg-surface">Sair</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
```

(Se `Avatar` de `@fulltime/ui` não aceitar props `src`/`name`, checar a assinatura em `packages/ui/src/components/avatar.tsx` e adaptar as props.)

- [ ] **Step 2: `AppLayout.astro`**

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro"
import { AppHeader } from "@/components/app/AppHeader.tsx"
interface Props { title: string; user: App.Locals['user'] }
const { title, user } = Astro.props
---
<BaseLayout title={title}>
  <AppHeader client:load user={user} />
  <slot />
</BaseLayout>
```

- [ ] **Step 3: Verificar render do header**

Trocar temporariamente `index.astro` para usar `AppLayout` passando `Astro.locals.user`, logar e abrir `/`.
Expected: header fixo com logo, nav, busca, avatar; menu do avatar abre e "Sair" desloga → vai para `/login`.

- [ ] **Step 4: Commit**

```bash
git add apps/app-streaming/src/components/app/AppHeader.tsx apps/app-streaming/src/layouts/AppLayout.astro
git commit -m "feat(app-streaming): app shell (header logado + layout)"
```

---

### Task 6: Home — seções com dados reais (hero, continue, formações)

Monta a home protegida buscando cursos e matrículas no server; hero e "continuar" como islands de carrossel; grade de formações estática. Entrega: `/` renderiza cursos reais e o progresso do usuário.

**Files:**
- Modify: `apps/app-streaming/src/pages/index.astro`
- Create: `apps/app-streaming/src/components/home/Hero.astro`
- Create: `apps/app-streaming/src/components/home/ContinueWatching.astro`
- Create: `apps/app-streaming/src/components/home/CourseGrid.astro`
- Create: `apps/app-streaming/src/components/home/CourseCard.astro`

**Interfaces:**
- Consumes: `apiServer` + tipos `CourseListItem`, `EnrollmentListItem` (Task 2); `AppLayout` (Task 5).
- Produces: `CourseCard.astro` com props `{ course: CourseListItem }`; `ContinueWatching.astro` com `{ enrollments: EnrollmentListItem[] }`; `CourseGrid.astro` com `{ title: string; courses: CourseListItem[] }`.

- [ ] **Step 1: `CourseCard.astro`**

```astro
---
import type { CourseListItem } from "@/lib/types"
interface Props { course: CourseListItem }
const { course } = Astro.props
---
<a href={`/aprender/${course.slug}`} class="group block overflow-hidden rounded-card bg-white shadow-card transition hover:shadow-lifted">
  <div class="aspect-video w-full bg-surface">
    {course.coverImage && <img src={course.coverImage} alt={course.title} class="h-full w-full object-cover" />}
  </div>
  <div class="p-4">
    <h3 class="font-display font-bold text-brand-navy line-clamp-2">{course.title}</h3>
    <p class="mt-1 text-xs text-muted-foreground">{course.instructor.name}</p>
  </div>
</a>
```

- [ ] **Step 2: `CourseGrid.astro`**

```astro
---
import type { CourseListItem } from "@/lib/types"
import CourseCard from "./CourseCard.astro"
interface Props { title: string; subtitle?: string; courses: CourseListItem[] }
const { title, subtitle, courses } = Astro.props
---
<section class="mx-auto max-w-7xl px-6 py-8">
  <h2 class="font-display text-xl font-extrabold text-brand-navy">{title}</h2>
  {subtitle && <p class="text-sm text-muted-foreground">{subtitle}</p>}
  <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {courses.map(c => <CourseCard course={c} />)}
  </div>
</section>
```

- [ ] **Step 3: `ContinueWatching.astro`** (usa progresso real)

```astro
---
import type { EnrollmentListItem } from "@/lib/types"
interface Props { enrollments: EnrollmentListItem[] }
const { enrollments } = Astro.props
const inProgress = enrollments.filter(e => e.status === 'ACTIVE' && e.progressCount < e.totalLessons)
const pct = (e: EnrollmentListItem) => e.totalLessons ? Math.round((e.progressCount / e.totalLessons) * 100) : 0
---
{inProgress.length > 0 && (
  <section class="mx-auto max-w-7xl px-6 py-8">
    <h2 class="font-display text-xl font-extrabold text-brand-navy">Continue de onde parou</h2>
    <p class="text-sm text-muted-foreground">Retome seus estudos e continue evoluindo.</p>
    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {inProgress.map(e => (
        <a href={`/aprender/${e.course.slug}`} class="block overflow-hidden rounded-card bg-white shadow-card">
          <div class="aspect-video bg-surface">
            {e.course.coverImage && <img src={e.course.coverImage} alt={e.course.title} class="h-full w-full object-cover" />}
          </div>
          <div class="p-3">
            <h3 class="text-sm font-semibold text-brand-navy line-clamp-2">{e.course.title}</h3>
            <div class="mt-2 h-1.5 w-full rounded-pill bg-surface">
              <div class="h-full rounded-pill bg-brand-blue" style={`width:${pct(e)}%`}></div>
            </div>
            <span class="mt-1 block text-xs text-muted-foreground">{pct(e)}% concluído</span>
          </div>
        </a>
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 4: `Hero.astro`** (destaque do primeiro curso publicado)

```astro
---
import type { CourseListItem } from "@/lib/types"
interface Props { course: CourseListItem | undefined }
const { course } = Astro.props
---
{course && (
  <section class="mx-auto max-w-7xl px-6 pt-8">
    <div class="relative overflow-hidden rounded-card bg-brand-navy text-white shadow-lifted">
      {course.coverImage && <img src={course.coverImage} alt="" class="absolute inset-0 h-full w-full object-cover opacity-40" />}
      <div class="relative max-w-xl p-10">
        <span class="inline-block rounded-pill bg-brand-blue px-3 py-1 text-xs font-semibold">Em destaque</span>
        <h1 class="mt-4 font-display text-3xl font-extrabold leading-tight">{course.title}</h1>
        {course.description && <p class="mt-3 text-sm text-white/80 line-clamp-3">{course.description}</p>}
        <a href={`/aprender/${course.slug}`} class="mt-6 inline-block rounded-pill bg-brand-amber px-6 py-3 font-semibold text-brand-navy">Assistir agora</a>
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 5: `index.astro` — busca no server + composição**

```astro
---
import AppLayout from "@/layouts/AppLayout.astro"
import Hero from "@/components/home/Hero.astro"
import ContinueWatching from "@/components/home/ContinueWatching.astro"
import CourseGrid from "@/components/home/CourseGrid.astro"
import { apiServer } from "@/lib/api"
import type { CourseListItem, EnrollmentListItem } from "@/lib/types"

const cookie = Astro.request.headers.get('cookie')
const [courses, enrollments] = await Promise.all([
  apiServer<CourseListItem[]>('/courses', cookie).catch(() => []),
  apiServer<EnrollmentListItem[]>('/enrollments', cookie).catch(() => []),
])
---
<AppLayout title="Início — Full Time" user={Astro.locals.user}>
  <Hero course={courses[0]} />
  <ContinueWatching enrollments={enrollments} />
  <CourseGrid title="Formações em destaque" subtitle="Conteúdos selecionados para a sua prática profissional." courses={courses} />
</AppLayout>
```

- [ ] **Step 6: Verificar dados reais**

Run: API em `:3333` + `pnpm --filter app-streaming dev`, logado.
Expected: hero mostra um curso real; "Continue de onde parou" reflete matrículas ativas com `%` correto; grade lista os cursos publicados de `/courses`. Sem curso/matrícula → seções vazias não quebram.

- [ ] **Step 7: Commit**

```bash
git add apps/app-streaming/src/pages/index.astro apps/app-streaming/src/components/home/Hero.astro apps/app-streaming/src/components/home/ContinueWatching.astro apps/app-streaming/src/components/home/CourseGrid.astro apps/app-streaming/src/components/home/CourseCard.astro
git commit -m "feat(app-streaming): home com dados reais (hero, continuar, formações)"
```

---

### Task 7: Home — seções de placeholder (fiéis ao design)

Adiciona as seções sem backend como placeholder visual fiel ao design (imagem 1): trilhas, categorias, recomendados, plano de estudos, eventos, professores, certificações, depoimentos, estatísticas, últimos conteúdos, FAQ e footer. Entrega: home visualmente completa como no design.

**Files:**
- Create: `apps/app-streaming/src/components/home/Trilhas.astro`
- Create: `apps/app-streaming/src/components/home/Categorias.astro`
- Create: `apps/app-streaming/src/components/home/PlanoEventos.astro` (faixa de 3 colunas: categorias/recomendados/plano)
- Create: `apps/app-streaming/src/components/home/ProfessoresEventos.astro`
- Create: `apps/app-streaming/src/components/home/Depoimentos.astro`
- Create: `apps/app-streaming/src/components/home/Stats.astro`
- Create: `apps/app-streaming/src/components/home/FAQ.astro`
- Create: `apps/app-streaming/src/components/home/SiteFooter.astro`
- Modify: `apps/app-streaming/src/pages/index.astro` (montar as seções)

**Interfaces:**
- Consumes: cores da marca. Cada componente é estático, sem props obrigatórias (mock interno). **Cada arquivo começa com um comentário `{/* PLACEHOLDER: sem endpoint — dados mock, substituir quando houver API */}`**.

- [ ] **Step 1: `Trilhas.astro`** — 4 "mundos" nas cores da logo

```astro
---
// PLACEHOLDER: sem modelo de trilha na API — dados mock, substituir quando houver.
const trilhas = [
  { nome: 'Alfabetização Inclusiva', cor: 'bg-brand-blue', cursos: 12, horas: 24 },
  { nome: 'Educação Infantil', cor: 'bg-brand-purple', cursos: 15, horas: 30 },
  { nome: 'Gestão Escolar', cor: 'bg-brand-green', cursos: 10, horas: 20 },
  { nome: 'Desenvolvimento Infantil', cor: 'bg-brand-amber', cursos: 14, horas: 21 },
]
---
<section class="mx-auto max-w-7xl px-6 py-8">
  <h2 class="font-display text-xl font-extrabold text-brand-navy">Trilhas de Aprendizagem</h2>
  <p class="text-sm text-muted-foreground">Jornadas completas para sua formação profissional.</p>
  <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {trilhas.map(t => (
      <div class={`rounded-card ${t.cor} p-5 text-white shadow-card`}>
        <h3 class="font-display text-lg font-bold">{t.nome}</h3>
        <p class="mt-1 text-sm text-white/85">{t.cursos} cursos · {t.horas}h</p>
        <span class="mt-4 inline-block rounded-pill bg-white/20 px-3 py-1 text-xs">Iniciante</span>
      </div>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Demais componentes de placeholder**

Criar `Categorias.astro`, `PlanoEventos.astro`, `ProfessoresEventos.astro`, `Depoimentos.astro`, `Stats.astro`, `FAQ.astro`, `SiteFooter.astro` seguindo o mesmo padrão do Step 1: cada um abre com o comentário PLACEHOLDER, usa dados mock internos e reproduz a seção correspondente do design (imagem 1) com as classes de token (`text-brand-navy`, `bg-brand-*`, `rounded-card`, `shadow-card`, `font-display`). Referência visual: `design/plataforma-geral/ChatGPT Image 3 de jul. de 2026, 14_55_38.png`.
- `Stats.astro`: faixa navy com "+500 Aulas", "+12 mil Profissionais", "+50 Especialistas", "98% Satisfação".
- `FAQ.astro`: grid 2 colunas de perguntas em `<details>`.
- `SiteFooter.astro`: footer navy com colunas Navegação/Institucional/Suporte/Newsletter + redes.

- [ ] **Step 3: Montar tudo em `index.astro`**

Inserir, na ordem do design, entre as seções reais da Task 6:
```astro
import Trilhas from "@/components/home/Trilhas.astro"
import Categorias from "@/components/home/Categorias.astro"
import PlanoEventos from "@/components/home/PlanoEventos.astro"
import ProfessoresEventos from "@/components/home/ProfessoresEventos.astro"
import Depoimentos from "@/components/home/Depoimentos.astro"
import Stats from "@/components/home/Stats.astro"
import FAQ from "@/components/home/FAQ.astro"
import SiteFooter from "@/components/home/SiteFooter.astro"
```
Ordem no `<AppLayout>`: `Hero` → `ContinueWatching` → `Trilhas` → `CourseGrid (Formações)` → `Categorias`/`PlanoEventos` → `ProfessoresEventos` → `Depoimentos`/`Stats` → `CourseGrid (Últimos conteúdos)` → `FAQ` → `SiteFooter`.

- [ ] **Step 4: Verificar a home completa**

Run: `pnpm --filter app-streaming dev`, logado.
Expected: home renderiza todas as seções na ordem do design, com fontes/cores da marca; nada quebra sem dados reais; placeholders visíveis e coerentes.

- [ ] **Step 5: Verificar build**

Run: `pnpm --filter app-streaming build`
Expected: build limpo.

- [ ] **Step 6: Commit**

```bash
git add apps/app-streaming/src/components/home/ apps/app-streaming/src/pages/index.astro
git commit -m "feat(app-streaming): seções de placeholder da home (trilhas, stats, faq, footer…)"
```

---

### Task 8: Player — casca + sidebar de currículo + dados

Cria a rota do player buscando curso + matrícula + progresso no server e a sidebar de módulos/aulas com seleção. Entrega: `/aprender/[slug]` renderiza o layout do player (imagem 2) com a aula ativa selecionável.

**Files:**
- Create: `apps/app-streaming/src/pages/aprender/[slug].astro`
- Create: `apps/app-streaming/src/components/player/CurriculumNav.tsx` (island)
- Create: `apps/app-streaming/src/components/player/EnrollGate.tsx` (island)

**Interfaces:**
- Consumes: `apiServer`, tipos `CourseDetail`, `EnrollmentListItem`, `EnrollmentDetail` (Task 2); `apiClient` (Task 2).
- Produces:
  - `CurriculumNav` props `{ modules: ModuleWithLessons[]; completedLessonIds: string[]; activeId: string; onSelect: (id: string) => void }`.
  - `EnrollGate` props `{ courseId: string }` (chama `POST /courses/:id/enroll` e recarrega).
  - A página passa dados iniciais do server para o island raiz do player (Task 9).

- [ ] **Step 1: `[slug].astro` — busca server-side + estados**

```astro
---
import AppLayout from "@/layouts/AppLayout.astro"
import { PlayerRoot } from "@/components/player/PlayerRoot.tsx"
import { EnrollGate } from "@/components/player/EnrollGate.tsx"
import { apiServer } from "@/lib/api"
import type { CourseDetail, EnrollmentListItem, EnrollmentDetail } from "@/lib/types"

const { slug } = Astro.params
const cookie = Astro.request.headers.get('cookie')

const course = await apiServer<CourseDetail>(`/courses/${slug}`, cookie).catch(() => null)
if (!course) return Astro.redirect('/')

const enrollments = await apiServer<EnrollmentListItem[]>('/enrollments', cookie).catch(() => [])
const found = enrollments.find(e => e.course.slug === slug) ?? null
const detail = found ? await apiServer<EnrollmentDetail>(`/enrollments/${found.id}`, cookie).catch(() => null) : null
const completedLessonIds = detail?.progress.map(p => p.lessonId) ?? []
const firstLesson = course.modules[0]?.lessons[0]?.id ?? null
---
<AppLayout title={`${course.title} — Full Time`} user={Astro.locals.user}>
  {!found ? (
    <EnrollGate client:load courseId={course.id} title={course.title} />
  ) : firstLesson ? (
    <PlayerRoot
      client:load
      course={course}
      enrollmentId={found.id}
      initialCompleted={completedLessonIds}
      initialLessonId={firstLesson}
    />
  ) : (
    <div class="mx-auto max-w-3xl px-6 py-20 text-center text-brand-navy/70">Este curso ainda não tem aulas.</div>
  )}
</AppLayout>
```

- [ ] **Step 2: `EnrollGate.tsx` island**

```tsx
import { useState } from 'react'
import { Button } from '@fulltime/ui'
import { apiClient, ApiError } from '@/lib/api'

interface Props { courseId: string; title: string }

export const EnrollGate = ({ courseId, title }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onEnroll = async () => {
    setLoading(true); setError('')
    try {
      await apiClient(`/courses/${courseId}/enroll`, { method: 'POST' })
      window.location.reload()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível matricular.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold text-brand-navy">{title}</h1>
      <p className="mt-2 text-brand-navy/70">Você ainda não está matriculado neste curso.</p>
      <Button onClick={onEnroll} disabled={loading} className="mt-6 bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
        {loading ? 'Matriculando…' : 'Matricular-se gratuitamente'}
      </Button>
      {error && <p role="alert" className="mt-3 text-sm text-brand-navy/80">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: `CurriculumNav.tsx` island** — sidebar do design (módulos expansíveis, progresso, aula ativa, cadeado)

```tsx
import { useState } from 'react'
import type { ModuleWithLessons } from '@/lib/types'

interface Props {
  modules: ModuleWithLessons[]
  completedLessonIds: string[]
  activeId: string
  onSelect: (id: string) => void
}

export const CurriculumNav = ({ modules, completedLessonIds, activeId, onSelect }: Props) => {
  const done = new Set(completedLessonIds)
  const [openId, setOpenId] = useState<string | null>(modules[0]?.id ?? null)

  return (
    <nav className="divide-y divide-hairline">
      {modules.map(m => {
        const total = m.lessons.length
        const completed = m.lessons.filter(l => done.has(l.id)).length
        const open = openId === m.id
        return (
          <div key={m.id}>
            <button onClick={() => setOpenId(open ? null : m.id)} className="flex w-full items-center justify-between px-4 py-3 text-left">
              <span className="font-display text-sm font-bold text-brand-navy">{m.title}</span>
              <span className="text-xs text-muted-foreground">{completed}/{total}</span>
            </button>
            {open && (
              <ul className="pb-2">
                {m.lessons.map(l => {
                  const isActive = l.id === activeId
                  const isDone = done.has(l.id)
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => onSelect(l.id)}
                        className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm ${isActive ? 'bg-brand-blue/10 text-brand-navy' : 'text-brand-navy/70 hover:bg-surface'}`}
                      >
                        <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${isDone ? 'bg-brand-green text-white' : 'border border-hairline'}`}>{isDone ? '✓' : ''}</span>
                        <span className="line-clamp-2">{l.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 4: Verificar sidebar + estados**

Substituir temporariamente `PlayerRoot` por um placeholder que renderize `CurriculumNav` para validar antes da Task 9 (ou implementar Task 9 na sequência e validar junto).
Expected: matrícula ausente → `EnrollGate`; matriculado → sidebar lista módulos/aulas, aula ativa destacada, concluídas com check verde; matricular funciona e recarrega.

- [ ] **Step 5: Commit**

```bash
git add apps/app-streaming/src/pages/aprender/ apps/app-streaming/src/components/player/CurriculumNav.tsx apps/app-streaming/src/components/player/EnrollGate.tsx
git commit -m "feat(app-streaming): rota do player + sidebar de currículo + gate de matrícula"
```

---

### Task 9: Player — reprodução de vídeo (Mux) + conclusão de aula

Cria o island raiz do player que orquestra aula ativa, carrega o vídeo Mux e marca conclusão. Entrega: vídeo real toca e "concluir aula" persiste, atualizando o progresso na sidebar.

**Files:**
- Create: `apps/app-streaming/src/components/player/PlayerRoot.tsx` (island raiz)
- Create: `apps/app-streaming/src/components/player/VideoStage.tsx` (Mux)

**Interfaces:**
- Consumes: `apiClient`, `ApiError`, tipos `CourseDetail`, `Lesson` (Task 2); `CurriculumNav` (Task 8); `VideoEmbed` de `@fulltime/ui`.
- Produces: `PlayerRoot` props `{ course: CourseDetail; enrollmentId: string; initialCompleted: string[]; initialLessonId: string }` — usado por `[slug].astro` (Task 8).

- [ ] **Step 1: `VideoStage.tsx`** — renderiza o vídeo por fonte

```tsx
import MuxPlayer from '@mux/mux-player-react'
import type { Lesson } from '@/lib/types'

interface Props { lesson: Lesson }

export const VideoStage = ({ lesson }: Props) => {
  const { video, title } = lesson
  if (video.source === 'MUX' && video.playbackId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-card bg-black">
        <MuxPlayer
          playbackId={video.playbackId}
          tokens={video.token ? { playback: video.token } : undefined}
          metadata={{ video_title: title }}
          accentColor="#032e5b"
          className="h-full w-full"
        />
      </div>
    )
  }
  if (video.embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-card">
        <iframe src={video.embedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      </div>
    )
  }
  return <div className="grid aspect-video w-full place-items-center rounded-card bg-brand-navy/10 text-sm text-brand-navy/60">Vídeo indisponível</div>
}
```

- [ ] **Step 2: `PlayerRoot.tsx`** — estado da aula ativa + fetch + conclusão + layout (imagem 2)

```tsx
import { useEffect, useState } from 'react'
import { Button } from '@fulltime/ui'
import type { CourseDetail, Lesson } from '@/lib/types'
import { apiClient, ApiError } from '@/lib/api'
import { CurriculumNav } from './CurriculumNav'
import { VideoStage } from './VideoStage'

interface Props {
  course: CourseDetail
  enrollmentId: string
  initialCompleted: string[]
  initialLessonId: string
}

export const PlayerRoot = ({ course, enrollmentId, initialCompleted, initialLessonId }: Props) => {
  const [activeId, setActiveId] = useState(initialLessonId)
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted))
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true); setError(''); setLesson(null)
    apiClient<Lesson>(`/lessons/${activeId}`)
      .then(data => { if (active) { setLesson(data); setLoading(false) } })
      .catch(e => { if (active) { setError(e instanceof ApiError ? e.message : 'Não foi possível carregar a aula.'); setLoading(false) } })
    return () => { active = false }
  }, [activeId])

  const isDone = completed.has(activeId)
  const onComplete = async () => {
    setSaving(true)
    try {
      await apiClient(`/enrollments/${enrollmentId}/lessons/${activeId}/complete`, { method: 'POST' })
      setCompleted(prev => new Set(prev).add(activeId))
    } catch { /* mantém estado; erro exibido no botão via saving reset */ }
    setSaving(false)
  }

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]">
      <aside className="border-r border-hairline">
        <div className="border-b border-hairline p-4">
          <a href="/" className="text-xs text-brand-blue">← Voltar para as formações</a>
          <h1 className="mt-2 font-display font-extrabold text-brand-navy line-clamp-2">{course.title}</h1>
        </div>
        <CurriculumNav modules={course.modules} completedLessonIds={[...completed]} activeId={activeId} onSelect={setActiveId} />
      </aside>
      <main className="min-w-0 p-6">
        {loading ? (
          <div className="grid aspect-video place-items-center rounded-card bg-surface text-sm text-brand-navy/60">Carregando…</div>
        ) : error || !lesson ? (
          <div role="alert" className="grid aspect-video place-items-center rounded-card bg-surface text-sm text-brand-navy/70">{error || 'Aula não encontrada.'}</div>
        ) : (
          <>
            <VideoStage lesson={lesson} />
            <div className="mt-5 flex items-start justify-between gap-4">
              <h2 className="font-display text-xl font-extrabold text-brand-navy">{lesson.title}</h2>
              <Button onClick={onComplete} disabled={isDone || saving} className={isDone ? 'border border-brand-green text-brand-green' : 'bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90'}>
                {isDone ? 'Aula concluída' : saving ? 'Salvando…' : 'Marcar como concluída'}
              </Button>
            </div>
            {lesson.content && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-brand-navy/80">{lesson.content}</p>}
          </>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verificar reprodução e conclusão**

Run: API em `:3333` + `pnpm --filter app-streaming dev`, curso com aula Mux `READY`.
Expected: ao abrir `/aprender/[slug]` matriculado, o player Mux carrega e reproduz; trocar de aula na sidebar troca o vídeo; "Marcar como concluída" persiste (`POST .../complete`) e a aula ganha check verde na sidebar; ao recarregar, permanece concluída.

- [ ] **Step 4: Commit**

```bash
git add apps/app-streaming/src/components/player/PlayerRoot.tsx apps/app-streaming/src/components/player/VideoStage.tsx
git commit -m "feat(app-streaming): player com vídeo mux e conclusão de aula"
```

---

### Task 10: Player — abas e painéis laterais (design imagem 2)

Completa o player com as abas (Sobre / Transcrição / Materiais / Atividades / Comentários) e o painel direito (Notas, Recursos, Próxima aula), fiel à imagem 2. Notas com persistência local (placeholder). Entrega: player visualmente completo como no design.

**Files:**
- Create: `apps/app-streaming/src/components/player/LessonTabs.tsx` (island interno)
- Create: `apps/app-streaming/src/components/player/SidePanel.tsx` (notas + recursos + próxima aula)
- Modify: `apps/app-streaming/src/components/player/PlayerRoot.tsx` (encaixar abas + painel, layout 3 colunas)

**Interfaces:**
- Consumes: tipos `Lesson`, `CourseDetail`, `Attachment` (Task 2); `Tabs` de `@fulltime/ui` (se a assinatura servir; senão implementar tabs local simples).
- Produces: `LessonTabs` props `{ lesson: Lesson; instructorName: string }`; `SidePanel` props `{ lesson: Lesson; nextLessonTitle: string | null }`.

- [ ] **Step 1: `LessonTabs.tsx`** — abas com estado local

```tsx
import { useState } from 'react'
import type { Lesson } from '@/lib/types'

interface Props { lesson: Lesson; instructorName: string }
const TABS = ['Sobre a aula', 'Transcrição', 'Materiais', 'Atividades', 'Comentários'] as const

export const LessonTabs = ({ lesson, instructorName }: Props) => {
  const [tab, setTab] = useState<typeof TABS[number]>('Sobre a aula')
  return (
    <div className="mt-6">
      <div className="flex gap-6 border-b border-hairline text-sm">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-3 font-medium ${tab === t ? 'border-brand-blue text-brand-navy' : 'border-transparent text-brand-navy/60 hover:text-brand-navy'}`}>{t}</button>
        ))}
      </div>
      <div className="py-5 text-sm leading-relaxed text-brand-navy/80">
        {tab === 'Sobre a aula' && (lesson.content ? <p className="whitespace-pre-wrap">{lesson.content}</p> : <p>Instrutor: {instructorName}.</p>)}
        {tab === 'Materiais' && (
          lesson.attachments.length
            ? <ul className="space-y-2">{lesson.attachments.map(a => <li key={a.id}><a href={a.url} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">{a.name}</a></li>)}</ul>
            : <p>Nenhum material para esta aula.</p>
        )}
        {/* PLACEHOLDER: sem endpoint — transcrição/atividades/comentários */}
        {tab === 'Transcrição' && <p className="text-brand-navy/50">Transcrição em breve.</p>}
        {tab === 'Atividades' && <p className="text-brand-navy/50">Atividades em breve.</p>}
        {tab === 'Comentários' && <p className="text-brand-navy/50">Comentários em breve.</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: `SidePanel.tsx`** — notas (persistência local) + recursos + próxima aula

```tsx
import { useEffect, useState } from 'react'
import { Button } from '@fulltime/ui'
import type { Lesson } from '@/lib/types'

interface Props { lesson: Lesson; nextLessonTitle: string | null }

export const SidePanel = ({ lesson, nextLessonTitle }: Props) => {
  const key = `nota:${lesson.id}`
  const [note, setNote] = useState('')
  useEffect(() => { setNote(localStorage.getItem(key) ?? '') }, [key])
  // PLACEHOLDER: sem endpoint de notas — persistência local até existir API.
  const save = () => localStorage.setItem(key, note)

  return (
    <aside className="space-y-6 border-l border-hairline p-5 lg:w-80">
      <section>
        <h3 className="font-display font-bold text-brand-navy">Notas da aula</h3>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Escreva suas anotações…" className="mt-2 h-28 w-full resize-none rounded-card border border-hairline bg-surface p-3 text-sm" />
        <Button onClick={save} className="mt-2 w-full bg-brand-blue font-semibold text-white hover:bg-brand-blue/90">Salvar nota</Button>
      </section>
      <section>
        <h3 className="font-display font-bold text-brand-navy">Recursos da aula</h3>
        {lesson.attachments.length ? (
          <ul className="mt-2 space-y-2">
            {lesson.attachments.map(a => (
              <li key={a.id} className="flex items-center justify-between rounded-card border border-hairline p-3 text-sm">
                <span className="truncate text-brand-navy">{a.name}</span>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-brand-blue">↓</a>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-brand-navy/50">Sem recursos.</p>}
      </section>
      {nextLessonTitle && (
        <section>
          <h3 className="font-display font-bold text-brand-navy">Próxima aula</h3>
          <p className="mt-2 rounded-card border border-hairline p-3 text-sm text-brand-navy/80">{nextLessonTitle}</p>
        </section>
      )}
    </aside>
  )
}
```

- [ ] **Step 3: Encaixar no `PlayerRoot.tsx`** — layout 3 colunas + próxima aula

Em `PlayerRoot`, importar `LessonTabs` e `SidePanel`; calcular `nextLessonTitle` a partir do currículo (aula seguinte à ativa na ordem plana). Trocar o grid para `lg:grid-cols-[300px_1fr_320px]`, colocando `<LessonTabs lesson={lesson} instructorName={course.instructor.name} />` abaixo do vídeo/título na coluna central e `<SidePanel lesson={lesson} nextLessonTitle={nextLessonTitle} />` como terceira coluna.

Helper para a próxima aula (dentro do componente):
```tsx
const flat = course.modules.flatMap(m => m.lessons)
const idx = flat.findIndex(l => l.id === activeId)
const nextLessonTitle = idx >= 0 && idx + 1 < flat.length ? flat[idx + 1].title : null
```

- [ ] **Step 4: Verificar player completo**

Run: `pnpm --filter app-streaming dev`, curso matriculado com materiais.
Expected: layout de 3 colunas como na imagem 2 — sidebar de aulas, vídeo + título + abas no centro, notas/recursos/próxima aula à direita. Abas trocam conteúdo; Materiais/Recursos listam anexos reais; nota salva e reaparece ao voltar; abas sem dado mostram "em breve".

- [ ] **Step 5: Verificar build final**

Run: `pnpm --filter app-streaming build`
Expected: build limpo.

- [ ] **Step 6: Commit**

```bash
git add apps/app-streaming/src/components/player/LessonTabs.tsx apps/app-streaming/src/components/player/SidePanel.tsx apps/app-streaming/src/components/player/PlayerRoot.tsx
git commit -m "feat(app-streaming): abas e painel lateral do player (notas, recursos, próxima aula)"
```

---

### Task 11: Branding (logos) + polish de estilização

Aplica a identidade visual real (logos em `apps/app-streaming/public/`) e faz um passe de refinamento visual em todos os componentes, fiel às imagens do design. Entrega: wordmarks de texto substituídos pela logo, favicon configurado, e componentes polidos (espaçamento, sombras, hover, raio, hierarquia tipográfica) como no `plataforma-geral`.

**Files:**
- Assets já presentes: `apps/app-streaming/public/logo.svg` (marca completa 991x905), `apps/app-streaming/public/icone.svg` (símbolo 586x582), `apps/app-streaming/public/icone.ico` (favicon).
- Modify: `apps/app-streaming/src/layouts/BaseLayout.astro` (favicon + preconnect fontes)
- Modify: `apps/app-streaming/src/components/app/AppHeader.tsx` (logo.svg no lugar do texto)
- Modify: `apps/app-streaming/src/layouts/AuthLayout.astro` (logo.svg centralizada)
- Modify: `apps/app-streaming/src/components/home/SiteFooter.astro` (logo em branco/negativo)
- Modify (polish): componentes de `src/components/home/` e `src/components/player/` — refinamento visual, sem novas features.

**Interfaces:**
- Consumes: assets em `public/` (servidos na raiz: `/logo.svg`, `/icone.svg`, `/icone.ico`).
- Produces: identidade visual consistente; nenhuma mudança de assinatura de componente.

- [ ] **Step 1: Favicon + head no `BaseLayout.astro`**

Adicionar no `<head>`:
```html
<link rel="icon" href="/icone.ico" sizes="any" />
<link rel="icon" type="image/svg+xml" href="/icone.svg" />
```

- [ ] **Step 2: Logo no `AppHeader.tsx`**

Trocar o wordmark de texto (`<a ...>Full <span>Time</span></a>`) por:
```tsx
<a href="/" className="flex items-center gap-2">
  <img src="/icone.svg" alt="Full Time" className="h-8 w-auto" />
  <span className="font-display text-xl font-extrabold text-brand-navy">Full <span className="text-brand-blue">Time</span></span>
</a>
```
(ícone à esquerda do wordmark; usar `/icone.svg` para o mark compacto no header.)

- [ ] **Step 3: Logo no `AuthLayout.astro`**

Trocar o wordmark de texto pela logo completa centralizada:
```astro
<div class="mb-8 flex justify-center">
  <img src="/logo.svg" alt="Full Time" class="h-16 w-auto" />
</div>
```

- [ ] **Step 4: Logo negativa no `SiteFooter.astro`**

No footer navy, usar a logo em versão clara (ex.: `class="h-10 w-auto brightness-0 invert"` sobre fundo escuro, se a SVG for colorida; senão a logo colorida sobre navy). Validar contraste visualmente.

- [ ] **Step 5: Passe de polish nos componentes**

Refinamento visual (sem novas features nem mudança de dados/props), fiel às imagens do design (`design/plataforma-geral/*.png`):
- Consistência de raio (`rounded-card`/`rounded-pill`), sombras (`shadow-card`/`shadow-lifted` em hover), espaçamento generoso (base branca com respiro), hierarquia tipográfica (`font-display` nos títulos).
- Cards: hover elevando (`hover:shadow-lifted`), transição suave, imagem `object-cover`.
- Hero, trilhas (4 cores da logo), grades: alinhamento e proporções como no design.
- Player: colunas equilibradas, sidebar com divisórias `border-hairline`, aba ativa com sublinhado `brand-blue`.
- Estados hover/focus visíveis (a11y), foco de teclado preservado.

- [ ] **Step 6: Verificar build + fidelidade visual**

Run: `pnpm --filter app-streaming build` (limpo) e `dev` logado.
Expected: logo aparece no header, auth e footer; favicon no navegador; componentes visualmente alinhados ao design, sem regressão de layout/quebra.

- [ ] **Step 7: Commit**

```bash
git add apps/app-streaming/public apps/app-streaming/src/layouts/BaseLayout.astro apps/app-streaming/src/layouts/AuthLayout.astro apps/app-streaming/src/components/app/AppHeader.tsx apps/app-streaming/src/components/home/ apps/app-streaming/src/components/player/
git commit -m "feat(app-streaming): branding (logos) + polish de estilização"
```

---

## Self-Review

**Spec coverage:**
- Frente 0 (design/tokens/fontes) → Task 1. ✓
- Frente 1 (fundação Astro, api.ts, auth-client) → Tasks 1–2. ✓
- Frente 2 (middleware, páginas de auth, trustedOrigins) → Tasks 3–4. ✓
- Frente 3 (home/catálogo real + placeholders, AppHeader) → Tasks 5–7. ✓
- Frente 4 (player: sidebar, Mux, abas, notas) → Tasks 8–10. ✓
- Segurança (sessão server-side, sem token em localStorage exceto nota placeholder) → Task 3 middleware. ✓

**Placeholder scan:** As seções sem backend são placeholders *intencionais* do produto (marcados com comentário no código), não lacunas do plano. Todo passo tem código real ou instrução concreta com referência visual.

**Type consistency:** `apiServer(path, cookie, init)` e `apiClient(path, init)` usados de forma consistente (Tasks 2, 3, 6, 8, 9). `PlayerRoot` props idênticas entre Task 8 (uso em `[slug].astro`) e Task 9 (definição). `CurriculumNav` props `completedLessonIds: string[]` batem em Tasks 8 e 9 (`[...completed]`). `Lesson.video` shape idêntico ao retorno da API (`GET /lessons/:id`).

**Notas de risco a validar durante a execução:**
- Versões `@astrojs/node`/`@astrojs/react` compatíveis com `astro@7` — resolver no `pnpm install` (Task 1, Step 2).
- Assinaturas exatas de `Avatar`, `Tabs`, `Button`, `Card`, `Input` em `@fulltime/ui` — conferir ao importar; adaptar props se divergir.
- Nomes exatos dos métodos do `better-auth/react` client (`requestPasswordReset`, `resetPassword`, `sendVerificationEmail`) — confirmar contra a versão `1.6.22` instalada; ajustar se a API do client diferir.

> Criado em 2026-07-03 16:10 (-03) · Última modificação: 2026-07-03 16:10 (-03)
