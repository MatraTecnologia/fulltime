'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { Child } from '@/lib/types'
import { Button, Card, CardContent, CardTitle, Dialog, EmptyState, Spinner } from '@fulltime/ui'
import ChildForm from '@/components/child-form'

const formatDate = (value: string | null) => {
  if (!value) return ''
  const [y, m, d] = value.slice(0, 10).split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR')
}

const CriancasPage = () => {
  const router = useRouter()
  const [children, setChildren] = useState<Child[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    apiFetch<Child[]>('/children')
      .then(setChildren)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar as crianças.')
        }
      })
  }, [router])

  const handleCreated = (child: Child) => {
    setChildren((prev) => [child, ...(prev ?? [])])
    setDialogOpen(false)
  }

  if (!children && !error) {
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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Crianças</h1>
        <Button onClick={() => setDialogOpen(true)}>Nova criança</Button>
      </div>

      {children!.length === 0 ? (
        <EmptyState
          title="Nenhuma criança cadastrada"
          description="Adicione uma criança para começar."
          className="mt-8"
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children!.map((child) => (
            <Link key={child.id} href={`/criancas/${child.id}`} className="block transition hover:-translate-y-0.5">
              <Card>
                <CardContent>
                  <CardTitle>{child.name}</CardTitle>
                  {child.birthDate && (
                    <p className="mt-1 text-sm text-brand-navy/60">
                      {formatDate(child.birthDate)}
                    </p>
                  )}
                  {child.diagnosis && (
                    <p className="mt-2 line-clamp-2 text-sm text-brand-navy/70">{child.diagnosis}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Nova criança">
        <ChildForm onCreated={handleCreated} />
      </Dialog>
    </div>
  )
}

export default CriancasPage
