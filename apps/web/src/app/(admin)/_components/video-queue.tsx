'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { VideoAsset } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { VideoStatusBadge } from './video-status-badge'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

const formatDate = (iso: string) => dateFormatter.format(new Date(iso))

type VideoQueueProps = {
  items: VideoAsset[]
  onDeleted: (id: string) => void
  onError: (message: string) => void
}

export const VideoQueue = ({ items, onDeleted, onError }: VideoQueueProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (asset: VideoAsset) => {
    const name = asset.filename ?? 'este vídeo'
    if (!window.confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return
    setDeletingId(asset.id)
    try {
      await apiFetch(`/admin/videos/${asset.id}`, { method: 'DELETE' })
      onDeleted(asset.id)
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Não foi possível excluir o vídeo.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vídeo</TableHead>
          <TableHead>Aula</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Enviado em</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell className="font-medium text-brand-navy">
              {asset.filename ?? 'Sem nome'}
            </TableCell>
            <TableCell className="text-muted-foreground">{asset.lesson?.title ?? '—'}</TableCell>
            <TableCell>
              <VideoStatusBadge status={asset.status} />
              {asset.status === 'ERRORED' && asset.error && (
                <p className="mt-1 max-w-xs truncate text-xs text-red-600" title={asset.error}>
                  {asset.error}
                </p>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDate(asset.createdAt)}</TableCell>
            <TableCell>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Excluir ${asset.filename ?? 'vídeo'}`}
                disabled={deletingId === asset.id}
                onClick={() => handleDelete(asset)}
                className="text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
