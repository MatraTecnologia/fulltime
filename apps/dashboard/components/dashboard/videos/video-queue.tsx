"use client"

import { Film, Loader2, Trash2, TriangleAlert } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/dashboard/empty-state"
import { useDeleteVideo } from "@/hooks/use-videos"
import type { VideoAsset, VideoAssetStatus } from "@/services/videos"

export interface ActiveUpload {
  tempId: string
  name: string
  progress: number
}

const statusLabel: Record<VideoAssetStatus, string> = {
  WAITING_UPLOAD: "Aguardando envio",
  UPLOADING: "Enviando",
  PROCESSING: "Processando",
  READY: "Pronto",
  ERRORED: "Erro",
}

export const VideoQueue = ({ uploads, items }: { uploads: ActiveUpload[]; items: VideoAsset[] }) => {
  const deleteVideo = useDeleteVideo()

  if (uploads.length === 0 && items.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="Nenhum vídeo na fila"
        description="Envie um vídeo para começar. O processamento roda automaticamente no servidor."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {uploads.map((upload) => (
        <li key={upload.tempId} className="rounded-lg border bg-background p-3">
          <div className="mb-2 flex items-center gap-2">
            <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            <p className="min-w-0 flex-1 truncate text-sm font-medium">{upload.name}</p>
            <span className="text-xs tabular-nums text-muted-foreground">{upload.progress}%</span>
          </div>
          <Progress value={upload.progress} />
        </li>
      ))}

      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {item.status === "ERRORED" ? (
              <TriangleAlert className="size-4.5 text-destructive" />
            ) : (
              <Film className="size-4.5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.filename ?? "Vídeo sem nome"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.status === "ERRORED" && item.error ? item.error : statusLabel[item.status]}
            </p>
          </div>
          <Badge
            variant={item.status === "ERRORED" ? "destructive" : "secondary"}
            className="shrink-0 text-[0.7rem]"
          >
            {statusLabel[item.status]}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground"
            aria-label="Remover vídeo"
            disabled={deleteVideo.isPending}
            onClick={() => deleteVideo.mutate(item.id)}
          >
            {deleteVideo.isPending ? <Spinner /> : <Trash2 className="size-4" />}
          </Button>
        </li>
      ))}
    </ul>
  )
}
