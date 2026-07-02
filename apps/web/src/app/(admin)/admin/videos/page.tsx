'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Film, Loader2, Plus, Video } from 'lucide-react'
import { StatCard } from '@fulltime/ui'
import { apiFetch, ApiError } from '@/lib/api'
import type { VideoAsset } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader } from '../../_components/page-header'
import { VideoUploader } from '../../_components/video-uploader'
import { VideoQueue } from '../../_components/video-queue'
import { isPendingStatus } from '../../_components/video-status-badge'

const POLL_INTERVAL = 3000

const VideosPage = () => {
  const router = useRouter()
  const [videos, setVideos] = useState<VideoAsset[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const fetchVideos = useCallback(async () => {
    try {
      const data = await apiFetch<VideoAsset[]>('/admin/videos')
      setVideos(data)
      setError(null)
      return data
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.replace('/login')
      else setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os vídeos.')
      return null
    }
  }, [router])

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout>
    const tick = async () => {
      const data = await fetchVideos()
      if (!active) return
      if (data && data.some((v) => isPendingStatus(v.status))) {
        timer = setTimeout(tick, POLL_INTERVAL)
      }
    }
    tick()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [fetchVideos, reloadKey])

  const stats = useMemo(() => {
    const list = videos ?? []
    return {
      total: list.length,
      processing: list.filter((v) => isPendingStatus(v.status)).length,
      ready: list.filter((v) => v.status === 'READY').length,
    }
  }, [videos])

  const handleUploaded = () => setReloadKey((k) => k + 1)
  const handleDeleted = (id: string) => setVideos((prev) => prev?.filter((v) => v.id !== id) ?? null)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Vídeos"
        description="Envie e acompanhe o processamento dos vídeos das aulas."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Enviar vídeo
          </Button>
        }
      />

      {videos && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total de vídeos" value={stats.total} accent="navy" icon={<Film />} />
          <StatCard label="Processando" value={stats.processing} accent="amber" icon={<Loader2 />} />
          <StatCard label="Prontos" value={stats.ready} accent="green" icon={<CheckCircle2 />} />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]">
        {!videos ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="size-7 text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-navy-50 text-brand-navy">
                <Video className="size-6" />
              </div>
              <EmptyTitle>Nenhum vídeo ainda</EmptyTitle>
              <EmptyDescription>Envie o primeiro vídeo para começar.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <VideoQueue items={videos} onDeleted={handleDeleted} onError={setError} />
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar vídeo</DialogTitle>
            <DialogDescription>
              Selecione um arquivo para enviar ao Mux. O processamento continua no servidor após o envio.
            </DialogDescription>
          </DialogHeader>
          <VideoUploader onSuccess={handleUploaded} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VideosPage
