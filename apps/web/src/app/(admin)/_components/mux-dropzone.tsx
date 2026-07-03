'use client'

import type { ComponentProps, CSSProperties } from 'react'
import { UploadCloud } from 'lucide-react'
import MuxUploader, { MuxUploaderDrop, MuxUploaderFileSelect } from '@mux/mux-uploader-react'

type UploaderProps = ComponentProps<typeof MuxUploader>

const uploaderStyle = {
  '--progress-bar-fill-color': 'var(--color-brand-blue)',
  '--progress-radial-fill-color': 'var(--color-brand-blue)',
} as CSSProperties

type MuxDropzoneProps = {
  uploaderId: string
  endpoint: UploaderProps['endpoint']
  onUploadStart: () => void
  onProgress: (value: number) => void
  onSuccess: () => void
  onUploadError: (message: string) => void
}

const MuxDropzone = ({ uploaderId, endpoint, onUploadStart, onProgress, onSuccess, onUploadError }: MuxDropzoneProps) => (
  <>
    <MuxUploader
      id={uploaderId}
      endpoint={endpoint}
      style={uploaderStyle}
      noDrop
      noProgress
      noStatus
      noRetry
      className="hidden"
      onUploadStart={onUploadStart}
      onProgress={((e: CustomEvent<number>) => onProgress(Math.round(e.detail))) as unknown as UploaderProps['onProgress']}
      onSuccess={onSuccess}
      onUploadError={(e: CustomEvent<{ message: string }>) => onUploadError(e.detail?.message ?? 'Falha no envio do vídeo.')}
    />
    <MuxUploaderDrop
      muxUploader={uploaderId}
      overlay
      overlayText="Solte para enviar"
      className="block cursor-pointer rounded-card border-2 border-dashed border-brand-navy/15 bg-brand-navy-50/30 transition-colors hover:border-brand-navy/30 [--overlay-background-color:var(--color-brand-blue)]"
    >
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-white text-brand-navy shadow-card">
          <UploadCloud className="size-5" />
        </span>
        <p className="text-sm font-semibold text-brand-navy">Arraste um vídeo ou selecione um arquivo</p>
        <p className="text-xs text-muted-foreground">MP4, MOV ou WebM — o processamento continua no servidor</p>
        <MuxUploaderFileSelect muxUploader={uploaderId}>
          <span className="mt-1 inline-flex h-9 items-center rounded-lg bg-brand-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90">
            Selecionar arquivo
          </span>
        </MuxUploaderFileSelect>
      </div>
    </MuxUploaderDrop>
  </>
)

export default MuxDropzone
