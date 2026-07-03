import { useState } from 'react'
import { Avatar } from '@fulltime/ui'
import { signOut } from '@/lib/auth-client'

interface Props {
  user: { name: string; image: string | null; role: string } | null
}

const NAV = ['Início', 'Formações', 'Trilhas', 'Categorias', 'Eventos', 'Certificações']

export const AppHeader = ({ user }: Props) => {
  const [open, setOpen] = useState(false)

  const onSignOut = async () => {
    await signOut()
    window.location.assign('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <a href="/" className="font-display text-xl font-extrabold text-brand-navy">
          Full <span className="text-brand-blue">Time</span>
        </a>
        <nav className="hidden items-center gap-5 text-sm font-medium text-brand-navy/70 lg:flex">
          {NAV.map((item) => (
            <a key={item} href="/" className="hover:text-brand-navy">
              {item}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <input
            placeholder="Procurar conteúdo…"
            className="hidden w-64 rounded-pill border border-hairline bg-surface px-4 py-2 text-sm md:block"
          />
          <button aria-label="Notificações" className="text-brand-navy/60 hover:text-brand-navy">
            🔔
          </button>
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2">
              <Avatar src={user?.image ?? undefined} name={user?.name ?? 'Usuário'} size="sm" />
              <span className="hidden text-sm text-brand-navy sm:block">{user?.name?.split(' ')[0]}</span>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-40 rounded-card border border-hairline bg-white p-1 shadow-card">
                <a href="/perfil" className="block rounded-md px-3 py-2 text-sm hover:bg-surface">
                  Perfil
                </a>
                <button
                  onClick={onSignOut}
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
