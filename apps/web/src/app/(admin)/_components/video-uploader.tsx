'use client'

import { useId, useState } from 'react'
import dynamic from 'next/dynamic'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CreateUploadResponse } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'

const MuxDropzone = dynamic(() => import('./mux-dropzone'), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center rounded-card border-2 border-dashed border-brand-navy/15">
      <Spinner className="size-6 text-primary" />
    </div>
  ),
})

type VideoUploaderProps = {
  lessonId?: string
  onSuccess?: () => void
}

export const VideoUploader = ({ lessonId, onSuccess }: VideoUploaderProps) => {
  const uploaderId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createEndpoint = async (file?: File) => {
    setError(null)
    try {
      const res = await apiFetch<CreateUploadResponse>('/admin/videos/uploads', {
        method: 'POST',
        body: JSON.stringify({ lessonId, filename: file?.name }),
      })
      return res.uploadUrl
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível iniciar o upload.'
      setError(message)
      throw new Error(message)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-brand-green/25 bg-brand-green/5 px-6 py-8 text-center">
        <CheckCircle2 className="size-8 text-brand-green-strong" aria-hidden />
        <p className="font-display font-bold text-brand-navy">Vídeo enviado</p>
        <p className="text-sm text-muted-foreground">
          O processamento continua no servidor. O status aparece na fila em instantes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <MuxDropzone
        uploaderId={uploaderId}
        endpoint={createEndpoint}
        onUploadStart={() => {
          setUploading(true)
          setProgress(0)
          setError(null)
        }}
        onProgress={setProgress}
        onSuccess={() => {
          setUploading(false)
          setDone(true)
          onSuccess?.()
        }}
        onUploadError={(message) => {
          setUploading(false)
          setError(message)
        }}
      />

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-brand-blue-strong">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Enviando… {progress}%
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-navy-50">
            <div
              className="h-full rounded-full bg-brand-blue transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
