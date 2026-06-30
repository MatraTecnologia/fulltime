'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import type { Role } from '@/lib/types'
import { Avatar } from '@fulltime/ui'

type MenuUser = { name: string; email: string; image?: string | null; role?: Role }

export const UserMenu = ({ user }: { user: MenuUser }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    router.push('/login')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Menu do usuário"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-brand-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
      >
        <Avatar name={user.name} src={user.image} size="sm" />
        <span className="hidden text-sm font-medium text-brand-navy sm:block">{user.name}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg bg-white py-1 shadow-md ring-1 ring-black/5">
            <a
              href="/perfil"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-brand-navy hover:bg-brand-navy/5"
            >
              Perfil
            </a>
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  )
}
