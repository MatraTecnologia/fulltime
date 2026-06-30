'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { Child } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
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
        <Spinner className="size-8" />
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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Crianças</h1>
        <Button onClick={() => setDialogOpen(true)}>Nova criança</Button>
      </div>

      {children!.length === 0 ? (
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyTitle>Nenhuma criança cadastrada</EmptyTitle>
            <EmptyDescription>Adicione uma criança para começar.</EmptyDescription>
          </EmptyHeader>
        </Empty>
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

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) setDialogOpen(false) }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Nova criança</DialogTitle>
          </DialogHeader>
          <ChildForm onCreated={handleCreated} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CriancasPage
