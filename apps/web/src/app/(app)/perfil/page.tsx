'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Shield } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { User } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Spinner } from '@/components/ui/spinner'
import { PageHeader } from '../_components/page-header'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  instrutor: 'Instrutor',
  profissional: 'Profissional',
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const PerfilPage = () => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<User>('/users/me')
      .then(setUser)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar o perfil.')
        }
      })
  }, [router])

  if (!user && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-7 text-brand-navy" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-destructive" role="alert">{error}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Meu perfil" description="Seus dados de acesso na plataforma." />

      <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]">
        <div className="flex flex-col items-center gap-4 bg-brand-navy p-8 sm:flex-row">
          <Avatar className="size-20 ring-2 ring-brand-amber ring-offset-2 ring-offset-brand-navy">
            {user!.image && <AvatarImage src={user!.image} alt={user!.name} />}
            <AvatarFallback className="bg-white/10 font-display text-2xl font-bold text-white">
              {getInitials(user!.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-white">
              {user!.name}
            </h2>
            <p className="mt-0.5 text-sm text-white/60">
              {ROLE_LABEL[user!.role] ?? user!.role}
            </p>
          </div>
        </div>

        <dl className="divide-y divide-hairline p-2">
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/15 text-brand-blue-strong">
              <Mail className="size-4" />
            </span>
            <div>
              <dt className="text-xs text-muted-foreground">E-mail</dt>
              <dd className="font-medium text-brand-navy">{user!.email}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-purple/15 text-brand-purple-strong">
              <Shield className="size-4" />
            </span>
            <div>
              <dt className="text-xs text-muted-foreground">Função</dt>
              <dd className="font-medium text-brand-navy">
                {ROLE_LABEL[user!.role] ?? user!.role}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  )
}

export default PerfilPage
