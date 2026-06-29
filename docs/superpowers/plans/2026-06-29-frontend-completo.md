# Frontend Completo — Plataforma Full Time (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Implementa o spec `docs/superpowers/specs/2026-06-29-frontend-completo-design.md`. Cria `apps/web` (Next.js 16) integrado ao backend `apps/api` já completo. Steps usam checkbox (`- [ ]`).

**Goal:** Entregar o frontend completo da plataforma — público (landing/catálogo), auth, área do profissional (dashboard, player, certificados, crianças) e painel admin/instrutor — em `apps/web`, integrado às rotas existentes da API.

**Architecture:** Next.js 16 App Router, renderização híbrida: `(public)` em Server Components (fetch direto na API, SEO); `(app)`/`(admin)` em Client Components com better-auth `useSession` + fetch client com `credentials: 'include'`. Middleware protege rotas logadas (UX); autorização real fica no backend. Acesso à API via `apiFetch` fino + tipos TS manuais. Componentes genéricos vão para `@fulltime/ui`; componentes de feature ficam no app.

**Tech Stack:** Next.js 16, React 19, Tailwind v4 (`@tailwindcss/postcss`), better-auth 1.6 client, `@fulltime/ui`, `@fulltime/config-ts`, `@fulltime/config-eslint`, TypeScript 5.9, pnpm + Turbo.

## Global Constraints

- **Stack/versões:** Next `^16.2.9`, React `19`, `tailwindcss@^4` + `@tailwindcss/postcss@^4`, `better-auth@^1.6.22`. Package name `@fulltime/web`.
- **ESM puro:** `const` arrow functions (exceto onde o Next exige `export default` para páginas/layouts/middleware). Imports de `@fulltime/ui` via package name, não path relativo.
- **Renderização:** `(public)` = Server Components; `(app)`/`(admin)` = Client Components (`'use client'`) usando `useSession`/`apiFetch`. A autorização real é do backend — middleware é só UX.
- **Acesso à API:** sempre via `apiFetch`/`apiServer` de `src/lib/api.ts` (nunca `fetch` cru nas páginas). `credentials: 'include'`. Base `process.env.NEXT_PUBLIC_API_URL`.
- **Identidade:** tokens do `@fulltime/ui` (navy `#003060`, amber `#f5b500`); fontes Nunito (display) / Inter (sans). Navy domina superfícies; acentos vibrantes pontuais. Acessibilidade WCAG AA (labels, foco visível, contraste, `aria-*`).
- **Sem `console.*`** em código entregue. **Sem comentários supérfluos.** Sem type annotations/comentários em código não modificado.
- **Verificação (sem testes automatizados):** cada task termina com `pnpm --filter @fulltime/web exec tsc --noEmit` limpo; tasks que mudam UI renderizável também com `pnpm --filter @fulltime/web build` (`next build`) sem erros. Smoke manual no final.
- **Commits:** um por task, mensagem `feat(web): ...`. Componentes adicionados ao design system: `feat(ui): ...`.
- **Roles:** `admin`, `instrutor`, `profissional`. `(admin)` exige `role ∈ {admin, instrutor}`.

## Dependências entre tasks (para orquestração / fan-out)

- **Task 1** (scaffold) bloqueia todas.
- **Task 2** (camada base + UI) bloqueia 3–10.
- **Task 3** (auth) e **Task 4** (público) podem rodar **em paralelo** após a 2 (público não depende de sessão).
- **Task 5** (app shell + dashboard) depende da 3. **Tasks 6, 7, 8** podem rodar **em paralelo** após a 5 (áreas independentes do `(app)`, arquivos disjuntos).
- **Task 9** (admin CRUD) depende da 2+5; **Task 10** (editor currículo) depende da 9 (mesma página de curso admin). 9→10 sequencial.
- **Task 11** (polish/build) por último.

Arquivos compartilhados que exigem cuidado no paralelismo: `src/lib/types.ts` (estabilizado na Task 2; tasks posteriores só leem), `packages/ui` (ampliado na Task 2; tasks posteriores só consomem). Cada task de área toca seu próprio route group — sem colisão.

---

### Task 1: Scaffold `apps/web`

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/postcss.config.mjs`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/eslint.config.mjs`
- Create: `apps/web/next-env.d.ts` (gerado pelo Next; não commitar se gitignored)
- Create: `apps/web/.env.example`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/app/(public)/page.tsx`

**Interfaces:**
- Produces: app `@fulltime/web` rodável (`next dev`), com `@fulltime/ui` transpilado e tokens carregados. Landing mínima usando `Button`/`Card` do design system.

- [ ] **Step 1: `package.json`**

```json
{
  "name": "@fulltime/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "@fulltime/ui": "workspace:*",
    "better-auth": "^1.6.22",
    "next": "^16.2.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@fulltime/config-eslint": "workspace:*",
    "@fulltime/config-ts": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^25.3.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9",
    "tailwindcss": "^4",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: `next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@fulltime/ui'],
}

export default nextConfig
```

- [ ] **Step 3: `postcss.config.mjs`**

```js
const config = {
  plugins: ['@tailwindcss/postcss'],
}

export default config
```

- [ ] **Step 4: `tsconfig.json`**

```json
{
  "extends": "@fulltime/config-ts/nextjs.json",
  "include": ["next-env.d.ts", "src", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: `eslint.config.mjs`**

```js
import base from '@fulltime/config-eslint/base'

export default base
```

- [ ] **Step 6: `.env.example`**

```
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

Criar também `apps/web/.env.local` com a mesma linha (gitignored) para `next dev` funcionar.

- [ ] **Step 7: `src/app/globals.css`**

```css
@import "tailwindcss";
@import "@fulltime/ui/theme.css";
@source "../../node_modules/@fulltime/ui/src";

body {
  background: var(--color-surface);
  font-family: var(--font-sans), system-ui, sans-serif;
  color: var(--color-brand-navy);
}
```

> Se o `@source` acima não resolver as classes do pacote (Tailwind v4 scanner), usar o caminho relativo até `packages/ui/src`: `@source "../../../../packages/ui/src";`. Validar no Step 10 que o estilo do `Button` aparece.

- [ ] **Step 8: `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

export const metadata: Metadata = {
  title: 'Full Time — Capacitação para educação inclusiva',
  description: 'Acolher · Desenvolver · Incluir',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR" className={`${inter.variable} ${nunito.variable}`}>
    <body>{children}</body>
  </html>
)

export default RootLayout
```

- [ ] **Step 9: `src/app/(public)/page.tsx`** (landing mínima — expandida na Task 4)

```tsx
import { Button, Card, CardContent, CardTitle } from '@fulltime/ui'

const HomePage = () => (
  <main className="mx-auto max-w-5xl px-6 py-20">
    <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-brand-navy">
      Acolher · Desenvolver · Incluir
    </h1>
    <p className="mt-4 max-w-xl text-lg text-brand-navy/70">
      Capacitação para profissionais que transformam a vida de crianças atípicas.
    </p>
    <div className="mt-8 flex gap-4">
      <Button>Explorar cursos</Button>
      <Button variant="outline">Entrar</Button>
    </div>
    <Card className="mt-16">
      <CardContent>
        <CardTitle>Plataforma em construção</CardTitle>
      </CardContent>
    </Card>
  </main>
)

export default HomePage
```

- [ ] **Step 10: Instalar e verificar**

Run: `pnpm install`
Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → Esperado: sem erros.
Run: `pnpm --filter @fulltime/web build` → Esperado: build OK, rota `/` gerada.
(Opcional manual: `pnpm --filter @fulltime/web dev` e abrir `http://localhost:3000` — landing com `Button` estilizado em amber/navy.)

- [ ] **Step 11: Commit**

```bash
git add apps/web/package.json apps/web/next.config.ts apps/web/postcss.config.mjs apps/web/tsconfig.json apps/web/eslint.config.mjs apps/web/.env.example apps/web/src pnpm-lock.yaml
git commit -m "feat(web): scaffold apps/web (next 16 + tailwind v4 + @fulltime/ui)"
```

---

### Task 2: Camada base (auth-client, api, types, middleware) + componentes UI

**Files:**
- Create: `apps/web/src/lib/auth-client.ts`
- Create: `apps/web/src/lib/api.ts`
- Create: `apps/web/src/lib/types.ts`
- Create: `apps/web/src/middleware.ts`
- Create em `@fulltime/ui`: `packages/ui/src/components/{label,field,select,textarea,checkbox,progress-bar,avatar,video-embed,dialog,tabs,table,empty-state,spinner}.tsx`
- Modify: `packages/ui/src/index.ts` (exportar os novos componentes)

**Interfaces:**
- Produces (consumidas por todas as tasks seguintes):
  - `auth-client.ts`: `export const authClient`, `export const { signIn, signUp, signOut, useSession } = authClient`. `useSession()` → `{ data: { user: { id, name, email, role, image } } | null, isPending: boolean }`.
  - `api.ts`:
    - `export class ApiError extends Error { status: number; body: unknown }`
    - `export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T>` — client-side, `credentials: 'include'`, base `NEXT_PUBLIC_API_URL`, lança `ApiError` em `!res.ok`, parseia JSON (ou `undefined` em 204).
    - `export const apiServer = async <T>(path: string, init?: RequestInit): Promise<T>` — Server Components; repassa `cookie` header via `next/headers`.
  - `types.ts`: tipos abaixo.
  - `@fulltime/ui`: novos componentes com props tipadas (assinaturas no Step 6).

- [ ] **Step 1: `src/lib/types.ts`** (espelha as respostas da API)

```ts
export type Role = 'admin' | 'instrutor' | 'profissional'
export type CourseStatus = 'DRAFT' | 'PUBLISHED'
export type VideoSource = 'MUX' | 'YOUTUBE' | 'VIMEO' | 'NONE'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type ChildRecordType = 'EVOLUCAO' | 'SESSAO' | 'PEI'

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
  video: { source: VideoSource; embedUrl: string | null }
}

export type Enrollment = {
  id: string; userId: string; courseId: string; status: EnrollmentStatus; enrolledAt: string
}
export type EnrollmentListItem = Enrollment & {
  course: { id: string; slug: string; title: string; coverImage: string | null }
  progressCount: number; totalLessons: number
}
export type LessonProgress = { id: string; lessonId: string; completedAt: string }
export type Certificate = { id: string; enrollmentId: string; code: string; issuedAt: string; url: string | null }
export type EnrollmentDetail = Enrollment & {
  progress: LessonProgress[]; certificate: Certificate | null
}

export type Child = { id: string; ownerProfId: string; name: string; birthDate: string | null; diagnosis: string | null; createdAt: string }
export type ChildRecord = { id: string; childId: string; authorId: string; type: ChildRecordType; content: string; date: string }
export type ChildDetail = Child & { records: ChildRecord[] }
```

- [ ] **Step 2: `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333',
  basePath: '/auth',
})

export const { signIn, signUp, signOut, useSession } = authClient
```

- [ ] **Step 3: `src/lib/api.ts`**

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body && 'error' in body ? String((body as { error: unknown }).error) : `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

const parse = async (res: Response) => {
  if (res.status === 204) return undefined
  const text = await res.text()
  return text ? JSON.parse(text) : undefined
}

export const apiFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await parse(res)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

export const apiServer = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { cookies } = await import('next/headers')
  const cookie = (await cookies()).toString()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', cookie, ...init?.headers },
    cache: 'no-store',
  })
  const body = await parse(res)
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}
```

- [ ] **Step 4: `src/middleware.ts`** (gate de UX para rotas logadas)

```ts
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/aprender', '/certificados', '/criancas', '/perfil', '/admin']

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  if (!needsAuth) return NextResponse.next()
  const token = request.cookies.get('better-auth.session_token')
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/aprender/:path*', '/certificados/:path*', '/criancas/:path*', '/perfil/:path*', '/admin/:path*'],
}
```

- [ ] **Step 5: Componentes UI genéricos em `@fulltime/ui`**

Seguir o estilo dos componentes existentes (`button.tsx`, `card.tsx`, `input.tsx`): `const` arrow, `cn(...)`, props estendendo os atributos HTML nativos, tokens via classes Tailwind (`text-brand-navy`, `bg-brand-amber`, `rounded-[var(--radius-card)]`). Criar:

- `label.tsx` → `Label` (`<label>` + estilo, prop `htmlFor`).
- `field.tsx` → `Field` (wrapper vertical: `Label` + children + `FormError` opcional). Props `{ label?: string; htmlFor?: string; error?: string; children }`.
- `select.tsx` → `Select` (`<select>` estilizado como o `Input`).
- `textarea.tsx` → `Textarea` (`<textarea>` estilizado).
- `checkbox.tsx` → `Checkbox` (`<input type="checkbox">` + label).
- `progress-bar.tsx` → `ProgressBar` props `{ value: number; max?: number }` (barra navy/amber, `role="progressbar"`, `aria-valuenow`).
- `avatar.tsx` → `Avatar` props `{ name: string; src?: string | null; size?: 'sm'|'md' }` (imagem ou iniciais).
- `video-embed.tsx` → `VideoEmbed` props `{ url: string | null; title?: string }` (iframe responsivo 16:9; se `url` null, placeholder "Vídeo indisponível").
- `dialog.tsx` → `Dialog` props `{ open: boolean; onClose: () => void; title?: string; children }` (overlay + painel; `role="dialog"`, fecha no ESC/backdrop). Client component (`'use client'`).
- `tabs.tsx` → `Tabs` props `{ tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }`. Client component.
- `table.tsx` → `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td` (wrappers estilizados).
- `empty-state.tsx` → `EmptyState` props `{ title: string; description?: string; action?: React.ReactNode }`.
- `spinner.tsx` → `Spinner` props `{ size?: 'sm'|'md' }` (loader acessível, `role="status"`).

- [ ] **Step 6: Exportar em `packages/ui/src/index.ts`**

Acrescentar (sem remover os exports atuais):

```ts
export * from './components/label.js'
export * from './components/field.js'
export * from './components/select.js'
export * from './components/textarea.js'
export * from './components/checkbox.js'
export * from './components/progress-bar.js'
export * from './components/avatar.js'
export * from './components/video-embed.js'
export * from './components/dialog.js'
export * from './components/tabs.js'
export * from './components/table.js'
export * from './components/empty-state.js'
export * from './components/spinner.js'
```

> Conferir o padrão de extensão dos imports já usados no `index.ts` atual (com ou sem `.js`) e seguir o mesmo.

- [ ] **Step 7: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/ui exec tsc --noEmit` (se houver script/config; senão pular) → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/components packages/ui/src/index.ts
git commit -m "feat(ui): componentes de formulario, navegacao e midia (field, select, dialog, video-embed, progress, table...)"
git add apps/web/src/lib apps/web/src/middleware.ts
git commit -m "feat(web): camada base (auth-client, api fetch tipado, types, middleware)"
```

---

### Task 3: Auth — login, cadastro, verificação, recuperação de senha

**Files:**
- Create: `apps/web/src/app/(auth)/layout.tsx`
- Create: `apps/web/src/app/(auth)/login/page.tsx`
- Create: `apps/web/src/app/(auth)/cadastro/page.tsx`
- Create: `apps/web/src/app/(auth)/verificar/page.tsx`
- Create: `apps/web/src/app/(auth)/recuperar-senha/page.tsx`
- Create: `apps/web/src/app/(auth)/redefinir-senha/page.tsx`

**Interfaces:**
- Consumes: `signIn`, `signUp`, `authClient` (`auth-client.ts`); `Field`, `Input`, `Button`, `Card` (`@fulltime/ui`).
- Produces: fluxo de autenticação completo. Após login → `/dashboard` (ou `?next=`). Após cadastro → `/verificar`.

- [ ] **Step 1: `(auth)/layout.tsx`** — centraliza o card de auth

```tsx
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center px-4 py-12">
    <div className="w-full max-w-md">{children}</div>
  </main>
)

export default AuthLayout
```

- [ ] **Step 2: `login/page.tsx`** (`'use client'`)

Form com campos e-mail/senha (`Field` + `Input`), botão `Button` com estado de loading (`Spinner`), erro via `ApiError`/retorno do better-auth. Submit:

```tsx
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button, Card, CardContent, CardTitle, Field, Input } from '@fulltime/ui'

const LoginPage = () => {
  const router = useRouter()
  const next = useSearchParams().get('next') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn.email({ email, password })
    setLoading(false)
    if (error) return setError(error.message ?? 'Falha no login.')
    router.push(next)
  }

  return (
    <Card>
      <CardContent>
        <CardTitle>Entrar</CardTitle>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Senha" htmlFor="password">
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Entrando…' : 'Entrar'}</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-brand-navy/70">
          <a href="/cadastro" className="hover:underline">Criar conta</a>
          <a href="/recuperar-senha" className="hover:underline">Esqueci a senha</a>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginPage
```

- [ ] **Step 3: `cadastro/page.tsx`** (`'use client'`)

Mesma estrutura; campos nome/e-mail/senha. Submit usa `signUp.email({ name, email, password })`; em sucesso `router.push('/verificar')`. NÃO enviar `role` (backend ignora — `input:false`). Mostrar erro do retorno.

- [ ] **Step 4: `verificar/page.tsx`** (Server Component estático)

Card informando que um e-mail de verificação foi enviado; instrui checar a caixa de entrada. Link para `/login`.

- [ ] **Step 5: `recuperar-senha/page.tsx`** (`'use client'`)

Campo e-mail; submit `authClient.forgetPassword({ email, redirectTo: '/redefinir-senha' })`; em sucesso, mensagem "se o e-mail existir, enviamos um link".

- [ ] **Step 6: `redefinir-senha/page.tsx`** (`'use client'`)

Lê `token` de `useSearchParams`; campos nova senha + confirmação; submit `authClient.resetPassword({ newPassword, token })`; em sucesso `router.push('/login')`.

> Conferir os nomes exatos dos métodos no better-auth client (`forgetPassword`/`resetPassword`) via Context7 (`better-auth react client`) antes de finalizar; ajustar se a API diferir.

- [ ] **Step 7: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK (rotas `(auth)/*`).

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/app/\(auth\)
git commit -m "feat(web): fluxo de autenticacao (login, cadastro, verificacao, recuperacao de senha)"
```

---

### Task 4: Público — catálogo e página de curso

**Files:**
- Modify: `apps/web/src/app/(public)/page.tsx` (landing com destaques)
- Create: `apps/web/src/app/(public)/cursos/page.tsx`
- Create: `apps/web/src/app/(public)/cursos/[slug]/page.tsx`
- Create: `apps/web/src/components/course-card.tsx`
- Create: `apps/web/src/components/enroll-button.tsx`

**Interfaces:**
- Consumes: `apiServer` (`api.ts`), `CourseListItem`/`CourseDetail` (`types.ts`), `Card`/`Button`/`CategoryBadge`/`VideoEmbed` (`@fulltime/ui`), `useSession` (no `EnrollButton`).
- Produces: `CourseCard` (`{ course: CourseListItem }`), `EnrollButton` (`{ courseId: string; slug: string }`).

- [ ] **Step 1: `components/course-card.tsx`** (Server-friendly, sem estado)

```tsx
import { Card, CardContent, CardTitle } from '@fulltime/ui'
import type { CourseListItem } from '@/lib/types'

export const CourseCard = ({ course }: { course: CourseListItem }) => (
  <a href={`/cursos/${course.slug}`} className="block transition hover:-translate-y-0.5">
    <Card>
      <CardContent>
        <CardTitle>{course.title}</CardTitle>
        <p className="mt-2 line-clamp-2 text-sm text-brand-navy/70">{course.description}</p>
        <p className="mt-3 text-xs text-brand-navy/50">{course._count.modules} módulos · {course.instructor.name}</p>
      </CardContent>
    </Card>
  </a>
)
```

- [ ] **Step 2: `cursos/page.tsx`** (Server Component)

```tsx
import { apiServer } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { CourseCard } from '@/components/course-card'
import { EmptyState } from '@fulltime/ui'

const CatalogPage = async () => {
  const courses = await apiServer<CourseListItem[]>('/courses')
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Cursos</h1>
      {courses.length === 0 ? (
        <EmptyState title="Nenhum curso disponível ainda" />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </main>
  )
}

export default CatalogPage
```

- [ ] **Step 3: `cursos/[slug]/page.tsx`** (Server Component)

Busca `apiServer<CourseDetail>('/courses/${slug}')`. Renderiza título, descrição, instrutor, e a lista de módulos com aulas (id/title/order/durationSec) como currículo (metadados, sem player). `notFound()` do Next se a API retornar 404 (curso inexistente/DRAFT sem permissão). Inclui `<EnrollButton courseId slug />` no topo.

```tsx
import { notFound } from 'next/navigation'
import { apiServer, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { EnrollButton } from '@/components/enroll-button'

const CoursePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  let course: CourseDetail
  try {
    course = await apiServer<CourseDetail>(`/courses/${slug}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">{course.title}</h1>
      <p className="mt-3 text-brand-navy/70">{course.description}</p>
      <EnrollButton courseId={course.id} slug={course.slug} />
      <section className="mt-10 space-y-6">
        {course.modules.map((m) => (
          <div key={m.id}>
            <h2 className="font-semibold text-brand-navy">{m.title}</h2>
            <ul className="mt-2 space-y-1 text-sm text-brand-navy/70">
              {m.lessons.map((l) => <li key={l.id}>{l.order}. {l.title}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </main>
  )
}

export default CoursePage
```

- [ ] **Step 4: `components/enroll-button.tsx`** (`'use client'`)

Usa `useSession`. Se não logado → link para `/login?next=/cursos/${slug}`. Se logado → botão que faz `apiFetch('/courses/${courseId}/enroll', { method: 'POST' })` e em sucesso `router.push('/aprender/${slug}')`. Trata `ApiError` (403 curso não publicado → mensagem).

- [ ] **Step 5: Landing `(public)/page.tsx`** — substituir o placeholder

Server Component: busca `apiServer<CourseListItem[]>('/courses')`, mostra hero (slogan) + grade de até 6 `CourseCard` em destaque + CTA para `/cursos` e `/cadastro`.

- [ ] **Step 6: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/\(public\) apps/web/src/components/course-card.tsx apps/web/src/components/enroll-button.tsx
git commit -m "feat(web): catalogo publico e pagina de curso (com matricula)"
```

---

### Task 5: App shell + dashboard

**Files:**
- Create: `apps/web/src/app/(app)/layout.tsx`
- Create: `apps/web/src/components/app-shell.tsx`
- Create: `apps/web/src/components/user-menu.tsx`
- Create: `apps/web/src/app/(app)/dashboard/page.tsx`
- Create: `apps/web/src/app/(app)/perfil/page.tsx`

**Interfaces:**
- Consumes: `useSession`, `signOut`, `apiFetch`, `EnrollmentListItem`/`User`, `Sidebar`/`Topbar`/`Avatar`/`ProgressBar`/`Spinner`/`Card`/`EmptyState`.
- Produces: `AppShell` (layout client com sidebar de navegação + topbar com `UserMenu`); todas as páginas `(app)` renderizam dentro dele. Padrão de "client page com fetch + loading/erro" reutilizado por 6/7/8.

- [ ] **Step 1: `components/app-shell.tsx`** (`'use client'`)

Sidebar com links (`Dashboard`, `Cursos`, `Certificados`, `Crianças`, `Perfil` e — se `role ∈ {admin,instrutor}` — `Admin`). Topbar com `UserMenu`. Usa `useSession`; enquanto `isPending`, mostra `Spinner`; se `data` null, redireciona para `/login` (`useEffect` + `router.replace`). Estrutura responsiva (sidebar colapsável em mobile).

- [ ] **Step 2: `components/user-menu.tsx`** (`'use client'`)

`Avatar` + nome; menu com "Perfil" e "Sair" (`signOut()` → `router.push('/login')`).

- [ ] **Step 3: `(app)/layout.tsx`**

```tsx
import { AppShell } from '@/components/app-shell'

const AppLayout = ({ children }: { children: React.ReactNode }) => <AppShell>{children}</AppShell>

export default AppLayout
```

- [ ] **Step 4: `dashboard/page.tsx`** (`'use client'`)

`useEffect` busca `apiFetch<EnrollmentListItem[]>('/enrollments')`; estados loading (`Spinner`) / erro / vazio (`EmptyState` com CTA para `/cursos`). Lista cada matrícula em `Card` com `ProgressBar value={progressCount} max={totalLessons}` e link para `/aprender/${course.slug}`.

- [ ] **Step 5: `perfil/page.tsx`** (`'use client'`)

Busca `apiFetch<User>('/users/me')`; mostra nome, e-mail, role, `Avatar`. (Edição de perfil fora de escopo.)

- [ ] **Step 6: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/\(app\)/layout.tsx apps/web/src/components/app-shell.tsx apps/web/src/components/user-menu.tsx apps/web/src/app/\(app\)/dashboard apps/web/src/app/\(app\)/perfil
git commit -m "feat(web): app shell (sidebar/topbar) + dashboard + perfil"
```

---

### Task 6: Player de aula + progresso

**Files:**
- Create: `apps/web/src/app/(app)/aprender/[slug]/page.tsx`
- Create: `apps/web/src/components/lesson-player.tsx`
- Create: `apps/web/src/components/curriculum-nav.tsx`

**Interfaces:**
- Consumes: `apiFetch`, `CourseDetail`/`EnrollmentListItem`/`EnrollmentDetail`/`Lesson`, `VideoEmbed`/`Button`/`ProgressBar`/`Spinner`/`Tabs`.
- Produces: experiência de assistir aula com marcação de progresso.

- [ ] **Step 1: `aprender/[slug]/page.tsx`** (`'use client'`)

Lê `slug` de `params`. Carrega em paralelo: `apiFetch<CourseDetail>('/courses/${slug}')` (currículo) e `apiFetch<EnrollmentListItem[]>('/enrollments')` para achar o enrollment do curso (match por `course.slug`). Se não houver matrícula → mensagem + botão para matricular (`POST /courses/:courseId/enroll`). Em seguida `apiFetch<EnrollmentDetail>('/enrollments/${enrollmentId}')` para o progresso. Mantém estado da aula selecionada; renderiza `CurriculumNav` (lista de módulos/aulas com check de concluída) + `LessonPlayer` da aula ativa.

- [ ] **Step 2: `components/curriculum-nav.tsx`** (`'use client'`)

Props `{ modules: ModuleWithLessons[]; completedLessonIds: Set<string>; activeId: string; onSelect: (lessonId: string) => void }`. Lista módulos → aulas; aula concluída recebe ícone/aria. Mostra `ProgressBar` do total.

- [ ] **Step 3: `components/lesson-player.tsx`** (`'use client'`)

Props `{ lessonId: string; enrollmentId: string; completed: boolean; onCompleted: (lessonId: string) => void }`. `useEffect` busca `apiFetch<Lesson>('/lessons/${lessonId}')`. Renderiza `VideoEmbed url={lesson.video.embedUrl}`, `content` (texto), e `attachments` (links). Botão "Marcar como concluída" → `apiFetch('/enrollments/${enrollmentId}/lessons/${lessonId}/complete', { method: 'POST' })`; em sucesso chama `onCompleted` (atualiza o set local) — idempotente no backend.

- [ ] **Step 4: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/\(app\)/aprender apps/web/src/components/lesson-player.tsx apps/web/src/components/curriculum-nav.tsx
git commit -m "feat(web): player de aula com progresso (video embed + concluir)"
```

---

### Task 7: Certificados

**Files:**
- Create: `apps/web/src/app/(app)/certificados/page.tsx`
- Create: `apps/web/src/components/certificate-card.tsx`

**Interfaces:**
- Consumes: `apiFetch`, `EnrollmentListItem`/`Certificate`, `Card`/`Button`/`Spinner`/`EmptyState`.
- Produces: lista de matrículas com emissão/visualização de certificado.

- [ ] **Step 1: `certificados/page.tsx`** (`'use client'`)

Busca `apiFetch<EnrollmentListItem[]>('/enrollments')`. Para cada matrícula 100% concluída (`progressCount === totalLessons && totalLessons > 0`), mostra `CertificateCard`. Matrículas incompletas aparecem com progresso e estão desabilitadas para emissão.

- [ ] **Step 2: `components/certificate-card.tsx`** (`'use client'`)

Props `{ enrollment: EnrollmentListItem }`. Botão "Emitir certificado" → `apiFetch<Certificate>('/enrollments/${id}/certificate', { method: 'POST' })` (422 se incompleto → mensagem). Quando emitido, renderiza o certificado no front: nome do curso, código (`cert.code`), data (`issuedAt`), identidade Full Time (navy/amber). Botão "Imprimir" usa `window.print()`.

- [ ] **Step 3: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/\(app\)/certificados apps/web/src/components/certificate-card.tsx
git commit -m "feat(web): certificados (emissao + visualizacao renderizada)"
```

---

### Task 8: Crianças + records

**Files:**
- Create: `apps/web/src/app/(app)/criancas/page.tsx`
- Create: `apps/web/src/app/(app)/criancas/[id]/page.tsx`
- Create: `apps/web/src/components/child-form.tsx`
- Create: `apps/web/src/components/record-form.tsx`

**Interfaces:**
- Consumes: `apiFetch`, `Child`/`ChildDetail`/`ChildRecord`/`ChildRecordType`, `Card`/`Button`/`Field`/`Input`/`Textarea`/`Select`/`Dialog`/`Spinner`/`EmptyState`.
- Produces: CRUD de crianças e registros do profissional logado.

- [ ] **Step 1: `criancas/page.tsx`** (`'use client'`)

Busca `apiFetch<Child[]>('/children')`. Lista em `Card`s com link para `/criancas/${id}`. Botão "Nova criança" abre `Dialog` com `ChildForm`. Estados loading/erro/vazio.

- [ ] **Step 2: `components/child-form.tsx`** (`'use client'`)

Props `{ onCreated: (child: Child) => void }`. Campos nome (req), nascimento (date), diagnóstico (textarea). Submit `apiFetch<Child>('/children', { method: 'POST', body: JSON.stringify({ name, birthDate, diagnosis }) })`.

- [ ] **Step 3: `criancas/[id]/page.tsx`** (`'use client'`)

Busca `apiFetch<ChildDetail>('/children/${id}')` (404 → `EmptyState`/redirect). Mostra dados + lista de `records` (ordenados por `date desc`, badge de `type`). Botão "Novo registro" abre `Dialog` com `RecordForm`. Excluir record → `apiFetch('/records/${recordId}', { method: 'DELETE' })`. Excluir criança → `apiFetch('/children/${id}', { method: 'DELETE' })` → `router.push('/criancas')`.

- [ ] **Step 4: `components/record-form.tsx`** (`'use client'`)

Props `{ childId: string; onCreated: (r: ChildRecord) => void }`. `Select` de `type` (`EVOLUCAO`/`SESSAO`/`PEI`), `Textarea` content, `Input` date opcional. Submit `apiFetch<ChildRecord>('/children/${childId}/records', { method: 'POST', body: JSON.stringify({ type, content, date }) })`.

- [ ] **Step 5: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/app/\(app\)/criancas apps/web/src/components/child-form.tsx apps/web/src/components/record-form.tsx
git commit -m "feat(web): modulo de criancas + records"
```

---

### Task 9: Admin — CRUD de cursos

**Files:**
- Create: `apps/web/src/app/(admin)/layout.tsx`
- Create: `apps/web/src/app/(admin)/admin/cursos/page.tsx`
- Create: `apps/web/src/app/(admin)/admin/cursos/novo/page.tsx`
- Create: `apps/web/src/app/(admin)/admin/cursos/[id]/page.tsx`
- Create: `apps/web/src/components/course-form.tsx`

**Interfaces:**
- Consumes: `useSession`, `apiFetch`, `CourseListItem`/`CourseDetail`/`CourseStatus`, `AppShell` (reutiliza o shell do app), `Table`/`Button`/`Field`/`Input`/`Textarea`/`Select`/`Spinner`.
- Produces: gestão de cursos para `admin`/`instrutor`. `CourseForm` reutilizado em novo/editar.

- [ ] **Step 1: `(admin)/layout.tsx`** (`'use client'`)

Reusa `AppShell`. Guard de role: `useSession`; se `role ∉ {admin, instrutor}` → `router.replace('/dashboard')`. Enquanto `isPending`, `Spinner`.

- [ ] **Step 2: `admin/cursos/page.tsx`** (`'use client'`)

Busca os cursos incluindo DRAFT: `apiFetch<CourseListItem[]>('/courses?status=DRAFT')` e `apiFetch<CourseListItem[]>('/courses?status=PUBLISHED')` (a API filtra por status; juntar as duas listas) — ou, se preferir uma chamada, `apiFetch('/courses?status=DRAFT')` + published. Renderiza `Table` com título, status (badge), módulos, ações (editar/excluir). Botão "Novo curso".

> Nota: o backend retorna só PUBLISHED quando `?status=` ausente, mesmo para admin (decisão registrada). Por isso fazer as duas chamadas com `?status=DRAFT` e `?status=PUBLISHED` e concatenar.

- [ ] **Step 3: `components/course-form.tsx`** (`'use client'`)

Props `{ initial?: CourseDetail; onSaved: (c: CourseDetail) => void }`. Campos title (req), description, coverImage, slug (opcional — placeholder "gerado do título"). Submit: se `initial` → `PATCH /courses/${initial.id}`; senão `POST /courses`. Trata 409 (slug duplicado → mensagem).

- [ ] **Step 4: `admin/cursos/novo/page.tsx`** (`'use client'`)

Renderiza `CourseForm`; `onSaved` → `router.push('/admin/cursos/${c.id}')`.

- [ ] **Step 5: `admin/cursos/[id]/page.tsx`** (`'use client'`)

Busca `apiFetch<CourseDetail>('/courses/${slug}')` — atenção: a rota é por **slug**, não id. Para admin editar por id, buscar via a listagem (que tem id+slug) ou navegar carregando o slug. **Decisão:** a página recebe `[id]`; buscar o curso na listagem admin (passar via query/estado) OU usar o slug na URL. Para simplicidade e bater com a API (`GET /courses/:slug`), **trocar o segmento dinâmico para `[slug]`** e navegar por slug a partir da listagem. Ajustar Steps 2/4/5 para usar `slug`. Renderiza `CourseForm initial`, botões Publicar (`POST /courses/${id}/publish`), Excluir (`DELETE /courses/${id}` → volta à lista). Inclui um placeholder onde a Task 10 monta o editor de currículo.

> **Resolução de ambiguidade (vale para o implementer):** usar `[slug]` como segmento dinâmico do detalhe admin (`/admin/cursos/[slug]`), pois a API expõe `GET /courses/:slug`. As mutações (`PATCH`/`publish`/`DELETE`) usam o `id` que vem no corpo do curso carregado. Atualizar os paths dos Steps 2/4 conforme.

- [ ] **Step 6: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/app/\(admin\) apps/web/src/components/course-form.tsx
git commit -m "feat(web): admin - crud de cursos (lista, criar, editar, publicar, excluir)"
```

---

### Task 10: Admin — editor de currículo (módulos + aulas + anexos)

**Files:**
- Modify: `apps/web/src/app/(admin)/admin/cursos/[slug]/page.tsx` (montar o editor)
- Create: `apps/web/src/components/curriculum-editor.tsx`
- Create: `apps/web/src/components/module-editor.tsx`
- Create: `apps/web/src/components/lesson-editor.tsx`

**Interfaces:**
- Consumes: `apiFetch`, `CourseDetail`/`ModuleWithLessons`/`Lesson`/`VideoSource`/`Attachment`, `Dialog`/`Button`/`Field`/`Input`/`Textarea`/`Select`/`Table`.
- Produces: gestão completa de módulos, aulas e anexos dentro da página de curso admin.

- [ ] **Step 1: `components/curriculum-editor.tsx`** (`'use client'`)

Props `{ course: CourseDetail; onChange: () => void }`. Lista módulos (`ModuleEditor`). Botão "Novo módulo" → `apiFetch('/courses/${course.id}/modules', { method: 'POST', body: JSON.stringify({ title }) })` (order calculado no backend). `onChange` re-busca o curso.

- [ ] **Step 2: `components/module-editor.tsx`** (`'use client'`)

Props `{ module: ModuleWithLessons; onChange: () => void }`. Editar título (`PATCH /modules/${id}`), excluir (`DELETE /modules/${id}`). Lista aulas (`LessonEditor`). Botão "Nova aula" → `apiFetch('/modules/${module.id}/lessons', { method: 'POST', body: JSON.stringify({ title }) })`.

- [ ] **Step 3: `components/lesson-editor.tsx`** (`'use client'`)

Props `{ lesson: LessonSummary; onChange: () => void }`. Abre `Dialog` de edição: busca `apiFetch<Lesson>('/lessons/${id}')`; campos title, content (`Textarea`), `Select` videoSource (`NONE`/`YOUTUBE`/`VIMEO`/`MUX`), videoRef, durationSec. Salvar `PATCH /lessons/${id}`. Excluir `DELETE /lessons/${id}`. Seção de anexos: listar `lesson.attachments`, adicionar (`POST /lessons/${id}/attachments` body `{ name, url, type? }`), excluir (`DELETE /attachments/${attId}`).

- [ ] **Step 4: Montar no `[slug]/page.tsx`**

Substituir o placeholder da Task 9 por `<CurriculumEditor course={course} onChange={reload} />`, onde `reload` re-busca `apiFetch<CourseDetail>('/courses/${slug}')`.

- [ ] **Step 5: Verificar**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → OK.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/components/curriculum-editor.tsx apps/web/src/components/module-editor.tsx apps/web/src/components/lesson-editor.tsx apps/web/src/app/\(admin\)/admin/cursos/\[slug\]/page.tsx
git commit -m "feat(web): admin - editor de curriculo (modulos, aulas, anexos)"
```

---

### Task 11: Polish — estados, responsivo, acessibilidade, build final

**Files:**
- Modify: páginas/componentes com estados faltantes (loading/erro/empty consistentes)
- Create: `apps/web/src/app/loading.tsx`, `apps/web/src/app/not-found.tsx`, `apps/web/src/app/error.tsx`
- Create: `apps/web/src/app/(app)/aprender/[slug]/loading.tsx` (e onde fizer sentido)

**Interfaces:**
- Consumes: `Spinner`/`EmptyState`.
- Produces: app polido e consistente.

- [ ] **Step 1: Boundaries globais**

`app/loading.tsx` (Spinner centralizado), `app/not-found.tsx` (404 amigável com link para `/`), `app/error.tsx` (`'use client'`, boundary de erro com botão "tentar novamente").

- [ ] **Step 2: Revisão de consistência**

Garantir que toda página client com fetch tem os três estados (loading via `Spinner`, erro com mensagem do `ApiError`, vazio com `EmptyState`). Garantir foco visível, `aria-label` em ícones-botão, contraste AA, navegação por teclado nos `Dialog`/`Tabs`/menu.

- [ ] **Step 3: Responsivo**

Sidebar colapsa em mobile (drawer); grids `sm/lg`; player empilha currículo abaixo do vídeo em telas pequenas.

- [ ] **Step 4: Build final + smoke**

Run: `pnpm --filter @fulltime/web exec tsc --noEmit` → sem erros.
Run: `pnpm --filter @fulltime/web build` → sem erros, todas as rotas geradas.
Smoke manual (API rodando em `:3333`, web em `:3000`): cadastro → verificar e-mail (marcar `emailVerified=true` no DB se Resend não entregar) → login → navegar catálogo → matricular → assistir/concluir aulas → emitir certificado → criar criança+record → como admin/instrutor: criar curso → módulos → aulas → publicar.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src
git commit -m "feat(web): polish - estados, boundaries, responsivo e acessibilidade"
```

---

## Notas de execução

- **Verificação de e-mail em dev:** signup exige `emailVerified`. Para smoke sem Resend entregar, marcar `users.emailVerified=true` no DB (Prisma Studio) ou usar o link real.
- **CORS/cookies cross-origin:** dev usa `:3000` (web) e `:3333` (api); `apiFetch` com `credentials:'include'` + CORS `credentials:true` da API cobrem. Garantir que `FRONTEND_URL=http://localhost:3000` está no `.env` da API (trustedOrigins).
- **Better-auth client:** confirmar nomes exatos dos métodos (`signIn.email`, `signUp.email`, `forgetPassword`, `resetPassword`, `useSession`) via Context7 (`better-auth react`) na Task 3 — ajustar se a versão 1.6 diferir.
- **Paralelismo (para o orquestrador SDD):** ver seção "Dependências entre tasks". Fan-out seguro: {3,4} após 2; {6,7,8} após 5; 9→10 sequencial. Cada área toca route group próprio — sem colisão de arquivos. `types.ts` e `@fulltime/ui` são estabilizados na Task 2 e só lidos depois.

> Criado em 2026-06-29 12:01 (-03) · Última modificação: 2026-06-29 12:01 (-03)
