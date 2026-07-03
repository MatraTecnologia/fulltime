import { defineMiddleware } from 'astro:middleware'
import { apiServer } from './lib/api'

const PUBLIC_PATHS = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha', '/verificar', '/verificar-codigo', '/preview-player', '/preview-profile', '/acesso-negado', '/manutencao', '/blog']

const isPublic = (pathname: string) =>
  PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url
  const cookie = context.request.headers.get('cookie')

  let user: App.Locals['user'] = null
  if (cookie) {
    const session = await apiServer<{ user: App.Locals['user'] } | null>('/auth/get-session', cookie).catch(() => null)
    user = session?.user ?? null
  }
  context.locals.user = user

  if (!user && !isPublic(pathname)) {
    const nextParam = encodeURIComponent(pathname + context.url.search)
    return context.redirect(`/login?next=${nextParam}`)
  }
  if (user && isPublic(pathname)) {
    return context.redirect('/')
  }
  return next()
})
