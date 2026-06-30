'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { ChildDetail, ChildRecord, ChildRecordType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import RecordForm from '@/components/record-form'

const TYPE_LABELS: Record<ChildRecordType, string> = {
  EVOLUCAO: 'Evolução',
  SESSAO: 'Sessão',
  PEI: 'PEI',
}

const TYPE_CLASSES: Record<ChildRecordType, string> = {
  EVOLUCAO: 'bg-blue-100 text-blue-700 border-blue-200',
  SESSAO: 'bg-green-100 text-green-700 border-green-200',
  PEI: 'bg-purple-100 text-purple-700 border-purple-200',
}

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
    setChild((prev) => prev ? { ...prev, records: [record, ...prev.records] } : prev)
    setRecordDialogOpen(false)
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Excluir este registro?')) return
    try {
      await apiFetch(`/records/${recordId}`, { method: 'DELETE' })
      setChild((prev) => prev ? { ...prev, records: prev.records.filter((r) => r.id !== recordId) } : prev)
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
      <Empty>
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
      {actionError && <p role="alert" className="mb-4 text-sm text-destructive">{actionError}</p>}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">{child!.name}</h1>
          {child!.birthDate && (
            <p className="mt-1 text-sm text-brand-navy/60">
              Nascimento: {formatDate(child!.birthDate)}
            </p>
          )}
          {child!.diagnosis && (
            <p className="mt-2 text-sm text-brand-navy/70">{child!.diagnosis}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleDeleteChild}>
          Excluir criança
        </Button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brand-navy">Registros</h2>
          <Button size="sm" onClick={() => setRecordDialogOpen(true)}>Novo registro</Button>
        </div>

        {child!.records.length === 0 ? (
          <Empty className="mt-4">
            <EmptyHeader>
              <EmptyTitle>Nenhum registro</EmptyTitle>
              <EmptyDescription>Adicione o primeiro registro desta criança.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {child!.records.map((record) => (
              <Card key={record.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={TYPE_CLASSES[record.type]}>
                        {TYPE_LABELS[record.type]}
                      </Badge>
                      <span className="text-xs text-brand-navy/50">
                        {formatDate(record.date)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteRecord(record.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                      aria-label="Excluir registro"
                    >
                      Excluir
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-brand-navy">{record.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
