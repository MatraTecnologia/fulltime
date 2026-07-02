'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Baby, ChevronRight, Plus } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Child } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import ChildForm from '@/components/child-form'
import { PageHeader } from '../_components/page-header'

const formatDate = (value: string | null) => {
  if (!value) return ''
  const [y, m, d] = value.slice(0, 10).split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR')
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

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
        <Spinner className="size-8 text-brand-navy" />
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
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Crianças"
        description="Acompanhe registros e compartilhe a evolução com responsáveis."
        action={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90"
          >
            <Plus className="size-4" />
            Nova criança
          </Button>
        }
      />

      {children!.length === 0 ? (
        <Empty className="rounded-card border-none bg-white shadow-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Baby />
            </EmptyMedia>
            <EmptyTitle>Nenhuma criança cadastrada</EmptyTitle>
            <EmptyDescription>Adicione uma criança para começar.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90"
            >
              <Plus className="size-4" />
              Nova criança
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {children!.map((child) => (
            <Link
              key={child.id}
              href={`/criancas/${child.id}`}
              className="group flex flex-col gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-brand-navy/[0.06] transition-shadow hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 font-display text-sm font-bold text-brand-blue-strong">
                    {getInitials(child.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-brand-navy">{child.name}</p>
                    {child.birthDate && (
                      <p className="text-xs text-muted-foreground">{formatDate(child.birthDate)}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-brand-navy/25 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-navy" />
              </div>
              {child.diagnosis && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{child.diagnosis}</p>
              )}
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
