import { defineMiddleware } from 'astro:middleware'
import { apiServer } from './lib/api'

// Telas de autenticação: usuário logado é redirecionado para fora delas.
const AUTH_PATHS = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/verificar']
// Rotas abertas a todos (logados ou não), sem redirecionar.
const OPEN_PATHS = ['/blog', '/acesso-negado', '/manutencao', '/preview-player', '/preview-profile']

const matches = (list: string[], pathname: string) =>
  list.some(p => pathname === p || pathname.startsWith(p + '/'))

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url
  const cookie = context.request.headers.get('cookie')

  let user: App.Locals['user'] = null
  if (cookie) {
    const session = await apiServer<{ user: App.Locals['user'] } | null>('/auth/get-session', cookie).catch(() => null)
    user = session?.user ?? null
  }
  context.locals.user = user

  const isAuthPage = matches(AUTH_PATHS, pathname)
  const isOpen = matches(OPEN_PATHS, pathname)

  if (!user && !isAuthPage && !isOpen) {
    const nextParam = encodeURIComponent(pathname + context.url.search)
    return context.redirect(`/login?next=${nextParam}`)
  }
  if (user && isAuthPage) {
    return context.redirect('/')
  }
  return next()
})
