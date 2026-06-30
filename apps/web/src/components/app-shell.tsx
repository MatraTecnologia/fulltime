'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import type { Role } from '@/lib/types'
import { Spinner } from '@fulltime/ui'
import { UserMenu } from './user-menu'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/certificados', label: 'Certificados' },
  { href: '/criancas', label: 'Crianças' },
  { href: '/perfil', label: 'Perfil' },
]

const ADMIN_LINK = { href: '/admin/cursos', label: 'Admin' }
const ADMIN_ROLES: Role[] = ['admin', 'instrutor']

const SidebarContent = ({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) => {
  const session = useSession()
  const role = (session.data?.user as { role?: Role } | null)?.role

  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-1 p-4">
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onLinkClick}
          aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined}
          className={[
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname === href || pathname.startsWith(`${href}/`)
              ? 'bg-brand-navy text-white'
              : 'text-brand-navy/70 hover:bg-brand-navy/10 hover:text-brand-navy',
          ].join(' ')}
        >
          {label}
        </Link>
      ))}
      {role && ADMIN_ROLES.includes(role) && (
        <Link
          href={ADMIN_LINK.href}
          onClick={onLinkClick}
          aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
          className={[
            'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            pathname.startsWith('/admin')
              ? 'bg-brand-navy text-white'
              : 'text-brand-navy/70 hover:bg-brand-navy/10 hover:text-brand-navy',
          ].join(' ')}
        >
          {ADMIN_LINK.label}
        </Link>
      )}
    </nav>
  )
}

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { data, isPending } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isPending && !data) router.replace('/login')
  }, [isPending, data, router])

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  useEffect(() => {
    if (drawerOpen) closeBtnRef.current?.focus()
  }, [drawerOpen])

  if (isPending || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden w-56 flex-col border-r border-black/5 bg-white lg:flex">
        <div className="flex h-14 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="" width={36} height={36} priority />
            <span className="font-display text-lg font-bold text-brand-navy">Full Time</span>
          </Link>
        </div>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-black/5 bg-white transition-transform duration-200 lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Menu principal"
        inert={!drawerOpen ? true : undefined}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
            <Image src="/logo.svg" alt="" width={36} height={36} />
            <span className="font-display text-lg font-bold text-brand-navy">Full Time</span>
          </Link>
          <button
            ref={closeBtnRef}
            type="button"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
            className="rounded p-1 text-brand-navy/60 hover:bg-brand-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarContent pathname={pathname} onLinkClick={() => setDrawerOpen(false)} />
      </aside>

      {/* Área principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 items-center gap-4 border-b border-black/5 bg-white px-4">
          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setDrawerOpen(true)}
            className="rounded p-1 text-brand-navy/60 hover:bg-brand-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div className="ml-auto">
            <UserMenu user={data.user as { name: string; email: string; image?: string | null; role?: Role }} />
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
