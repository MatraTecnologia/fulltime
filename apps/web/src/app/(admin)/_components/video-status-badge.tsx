import { AlertCircle, CheckCircle2, Loader2, UploadCloud } from 'lucide-react'
import type { VideoAssetStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

type StatusConfig = { label: string; className: string; Icon: typeof UploadCloud; spin?: boolean }

const STATUS_CONFIG: Record<VideoAssetStatus, StatusConfig> = {
  WAITING_UPLOAD: { label: 'Enviando', className: 'bg-brand-blue/12 text-brand-blue-strong', Icon: UploadCloud },
  UPLOADING: { label: 'Enviando', className: 'bg-brand-blue/12 text-brand-blue-strong', Icon: UploadCloud },
  PROCESSING: { label: 'Processando', className: 'bg-brand-amber/15 text-brand-amber-strong', Icon: Loader2, spin: true },
  READY: { label: 'Pronto', className: 'bg-brand-green/12 text-brand-green-strong', Icon: CheckCircle2 },
  ERRORED: { label: 'Erro', className: 'bg-red-500/12 text-red-600', Icon: AlertCircle },
}

export const isPendingStatus = (status: VideoAssetStatus) =>
  status === 'WAITING_UPLOAD' || status === 'UPLOADING' || status === 'PROCESSING'

export const VideoStatusBadge = ({ status }: { status: VideoAssetStatus }) => {
  const { label, className, Icon, spin } = STATUS_CONFIG[status]
  return (
    <Badge className={className}>
      <Icon className={spin ? 'animate-spin' : undefined} aria-hidden />
      {label}
    </Badge>
  )
}
