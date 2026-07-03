import { useState } from 'react'
import { Avatar } from '@fulltime/ui'
import { signOut } from '@/lib/auth-client'
import { IconSearch, IconBell } from '@/components/icons'

interface Props {
  user: { name: string; image: string | null; role: string } | null
}

const NAV = [
  { label: 'Início', href: '/' },
  { label: 'Formações', href: '/formacoes' },
  { label: 'Trilhas', href: '/trilhas' },
  { label: 'Categorias', href: '/categorias' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Certificações', href: '/certificacoes' },
  { label: 'Blog', href: '/blog' },
]

export const AppHeader = ({ user }: Props) => {
  const [open, setOpen] = useState(false)

  const onSignOut = async () => {
    await signOut()
    window.location.assign('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-6">
        <a href="/" className="flex shrink-0 items-center gap-2">
          <img src="/icone.svg" alt="" className="h-8 w-auto" />
          <span className="font-display text-lg font-extrabold text-brand-navy">
            Full <span className="text-brand-blue">Time</span>
          </span>
        </a>

        <nav className="hidden items-center gap-5 text-sm font-medium text-brand-navy/70 xl:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-brand-navy">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="relative mx-auto hidden w-full max-w-sm md:block">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-navy/40" />
          <input
            placeholder="Buscar conteúdo…"
            className="w-full rounded-pill border border-hairline bg-surface py-2.5 pl-10 pr-4 text-sm text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-blue/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <button aria-label="Notificações" className="text-brand-navy/50 transition-colors hover:text-brand-navy">
            <IconBell className="h-5 w-5" />
          </button>
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2" aria-haspopup="menu" aria-expanded={open}>
              <Avatar src={user?.image ?? undefined} name={user?.name ?? 'Usuário'} size="sm" />
              <span className="hidden text-sm font-medium text-brand-navy sm:block">{user?.name?.split(' ')[0]}</span>
            </button>
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-40 rounded-card border border-hairline bg-white p-1 shadow-card">
                <a href="/perfil" role="menuitem" className="block rounded-md px-3 py-2 text-sm hover:bg-surface">
                  Perfil
                </a>
                <button
                  onClick={onSignOut}
                  role="menuitem"
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-brand-navy hover:bg-surface"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
