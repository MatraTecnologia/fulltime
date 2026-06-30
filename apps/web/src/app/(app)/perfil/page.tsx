'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { User } from '@/lib/types'
import { Avatar, Card, CardContent, CardTitle, Spinner } from '@fulltime/ui'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  instrutor: 'Instrutor',
  profissional: 'Profissional',
}

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
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-600" role="alert">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-bold text-brand-navy">Perfil</h1>
      <Card className="mt-6">
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar name={user!.name} src={user!.image} size="md" />
            <div>
              <CardTitle>{user!.name}</CardTitle>
              <p className="text-sm text-brand-navy/60">{user!.email}</p>
            </div>
          </div>
          <div className="mt-4 border-t border-black/5 pt-4">
            <p className="text-sm text-brand-navy/70">
              <span className="font-medium">Função:</span>{' '}
              {ROLE_LABEL[user!.role] ?? user!.role}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PerfilPage
