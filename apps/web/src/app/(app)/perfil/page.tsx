'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Shield } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { User } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

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
          setError(
            e instanceof ApiError ? e.message : 'Não foi possível carregar o perfil.',
          )
        }
      })
  }, [router])

  if (!user && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-7 text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
      <Card>
        <CardContent className="p-0">
          {/* Cabeçalho do perfil */}
          <div className="flex flex-col items-center gap-4 bg-primary/5 p-8 sm:flex-row sm:items-center rounded-t-xl">
            <Avatar className="size-20">
              {user!.image && (
                <AvatarImage src={user!.image} alt={user!.name} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                {getInitials(user!.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user!.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {ROLE_LABEL[user!.role] ?? user!.role}
              </p>
            </div>
          </div>

          {/* Dados do perfil */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <p className="font-medium text-foreground">{user!.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Shield className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Função</p>
                <p className="font-medium text-foreground">
                  {ROLE_LABEL[user!.role] ?? user!.role}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerfilPage
