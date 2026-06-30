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
