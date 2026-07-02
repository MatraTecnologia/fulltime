'use client'

import { useState } from 'react'
import { Clock, Library, PlayCircle } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { VideoAsset } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface VideoLibraryPickerProps {
  lessonId: string
  onLinked: () => void | Promise<void>
}

const formatDuration = (sec: number | null) => {
  if (!sec) return null
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const VideoLibraryPicker = ({ lessonId, onLinked }: VideoLibraryPickerProps) => {
  const [open, setOpen] = useState(false)
  const [assets, setAssets] = useState<VideoAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const openDialog = async () => {
    setOpen(true)
    setSelected(null)
    setLinkError(null)
    setLoadError(null)
    setLoading(true)
    try {
      const data = await apiFetch<VideoAsset[]>('/admin/videos')
      setAssets(data.filter((a) => a.status === 'READY' && a.lessonId === null))
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Não foi possível carregar a biblioteca.')
    } finally {
      setLoading(false)
    }
  }

  const closeDialog = () => {
    setOpen(false)
    setSelected(null)
    setLinkError(null)
  }

  const handleConfirm = async () => {
    if (!selected) return
    setLinkError(null)
    setLinking(true)
    try {
      await apiFetch(`/lessons/${lessonId}/video/link`, {
        method: 'POST',
        body: JSON.stringify({ videoAssetId: selected }),
      })
      closeDialog()
      await onLinked()
    } catch (err) {
      setLinkError(err instanceof ApiError ? err.message : 'Não foi possível vincular o vídeo.')
    } finally {
      setLinking(false)
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={openDialog}>
        <Library className="size-4" aria-hidden />
        Escolher da biblioteca
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Biblioteca de vídeos</DialogTitle>
            <DialogDescription>
              Selecione um vídeo já processado e ainda não vinculado a nenhuma aula.
            </DialogDescription>
          </DialogHeader>

          {loading && (
            <div className="flex justify-center py-10">
              <Spinner className="size-6 text-primary" />
            </div>
          )}

          {loadError && !loading && (
            <p className="text-sm text-destructive" role="alert">{loadError}</p>
          )}

          {!loading && !loadError && assets.length === 0 && (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Library />
                </EmptyMedia>
                <EmptyTitle>Nenhum vídeo disponível na biblioteca</EmptyTitle>
                <EmptyDescription>
                  Todos os vídeos prontos já estão vinculados. Envie um novo vídeo para reutilizá-lo aqui.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!loading && !loadError && assets.length > 0 && (
            <>
              <ul className="-mx-1 flex max-h-72 flex-col gap-1.5 overflow-y-auto px-1">
                {assets.map((asset) => {
                  const active = selected === asset.id
                  const duration = formatDuration(asset.durationSec)
                  return (
                    <li key={asset.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(asset.id)}
                        aria-pressed={active}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                          active
                            ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
                            : 'border-hairline hover:border-brand-navy/20 hover:bg-brand-navy-50/50',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-9 shrink-0 items-center justify-center rounded-lg',
                            active ? 'bg-brand-blue/10 text-brand-blue-strong' : 'bg-brand-navy-50 text-brand-navy/50',
                          )}
                        >
                          <PlayCircle className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-brand-navy">
                            {asset.filename ?? 'Sem nome'}
                          </span>
                          {duration && (
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" aria-hidden />
                              {duration}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {linkError && (
                <p className="text-sm text-destructive" role="alert">{linkError}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={closeDialog} disabled={linking}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" onClick={handleConfirm} disabled={!selected || linking}>
                  {linking ? 'Vinculando...' : 'Vincular vídeo'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VideoLibraryPicker
