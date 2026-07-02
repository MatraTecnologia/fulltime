'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CalendarDays, Plus, Trash2 } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { ChildDetail, ChildRecord } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyContent, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import RecordForm from '@/components/record-form'
import { RecordList } from '../../_components/record-list'
import { ShareLinks } from '../../_components/share-links'

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const formatDate = (value: string | null) => {
  if (!value) return ''
  const [y, m, d] = value.slice(0, 10).split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR')
}

const CriancaDetalhePage = () => {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [child, setChild] = useState<ChildDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [recordDialogOpen, setRecordDialogOpen] = useState(false)

  useEffect(() => {
    apiFetch<ChildDetail>(`/children/${id}`)
      .then(setChild)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else if (e instanceof ApiError && e.status === 404) {
          setNotFound(true)
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os dados.')
        }
      })
  }, [id, router])

  const handleRecordCreated = (record: ChildRecord) => {
    setChild((prev) => (prev ? { ...prev, records: [record, ...prev.records] } : prev))
    setRecordDialogOpen(false)
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Excluir este registro?')) return
    try {
      await apiFetch(`/records/${recordId}`, { method: 'DELETE' })
      setChild((prev) =>
        prev ? { ...prev, records: prev.records.filter((r) => r.id !== recordId) } : prev,
      )
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível excluir o registro.')
    }
  }

  const handleDeleteChild = async () => {
    if (!window.confirm(`Excluir ${child?.name}? Esta ação não pode ser desfeita.`)) return
    try {
      await apiFetch(`/children/${id}`, { method: 'DELETE' })
      router.push('/criancas')
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível excluir a criança.')
    }
  }

  if (notFound) {
    return (
      <Empty className="rounded-card border-none bg-white shadow-card">
        <EmptyHeader>
          <EmptyTitle>Criança não encontrada</EmptyTitle>
          <EmptyDescription>Esta criança não existe ou você não tem acesso.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push('/criancas')}>
            Voltar
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!child && !error) {
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
    <div className="mx-auto max-w-4xl space-y-8">
      <button
        onClick={() => router.push('/criancas')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
      >
        <ArrowLeft className="size-4" />
        Crianças
      </button>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">{actionError}</p>
      )}

      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-brand-navy/[0.06] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 font-display text-lg font-bold text-brand-blue-strong">
              {getInitials(child!.name)}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-navy">
                {child!.name}
              </h1>
              {child!.birthDate && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {formatDate(child!.birthDate)}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteChild}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Excluir
          </Button>
        </div>
        {child!.diagnosis && (
          <p className="mt-4 border-t border-hairline pt-4 text-sm leading-relaxed text-brand-navy/80">
            {child!.diagnosis}
          </p>
        )}
      </div>

      <ShareLinks childId={id} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight text-brand-navy">
            Registros
          </h2>
          <Button
            size="sm"
            onClick={() => setRecordDialogOpen(true)}
            className="bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90"
          >
            <Plus className="size-4" />
            Novo registro
          </Button>
        </div>

        {child!.records.length === 0 ? (
          <Empty className="rounded-card border-none bg-white shadow-card">
            <EmptyHeader>
              <EmptyTitle>Nenhum registro</EmptyTitle>
              <EmptyDescription>Adicione o primeiro registro desta criança.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <RecordList records={child!.records} onDelete={handleDeleteRecord} />
        )}
      </section>

      <Dialog open={recordDialogOpen} onOpenChange={(o) => { if (!o) setRecordDialogOpen(false) }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Novo registro</DialogTitle>
          </DialogHeader>
          <RecordForm childId={id} onCreated={handleRecordCreated} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CriancaDetalhePage
