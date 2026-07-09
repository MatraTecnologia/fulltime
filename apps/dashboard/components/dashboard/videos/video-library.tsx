"use client"

import * as React from "react"
import { Film, Link2, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EmptyState } from "@/components/dashboard/empty-state"
import { LinkLessonDialog } from "@/components/dashboard/videos/link-lesson-dialog"
import { useDeleteVideo } from "@/hooks/use-videos"
import { formatDurationSec } from "@/services/courses-detail"
import type { VideoAsset } from "@/services/videos"

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })

export const VideoLibrary = ({ items }: { items: VideoAsset[] }) => {
  const deleteVideo = useDeleteVideo()
  const [linkingId, setLinkingId] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState<VideoAsset | null>(null)

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="Biblioteca vazia"
        description="Vídeos processados aparecem aqui, prontos para vincular a uma aula."
      />
    )
  }

  const confirmDelete = () => {
    if (!deleting) return
    deleteVideo.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-3 rounded-lg border bg-background p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Film className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.filename ?? "Vídeo sem nome"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDurationSec(item.durationSec)} · {formatDate(item.createdAt)}
                </p>
              </div>
            </div>

            {item.lesson ? (
              <Badge variant="outline" className="w-fit gap-1 text-[0.7rem] text-muted-foreground">
                <Link2 className="size-3" />
                Vinculada: {item.lesson.title}
              </Badge>
            ) : null}

            <div className="mt-auto flex items-center gap-2">
              {item.lesson ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-destructive"
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 className="size-4" />
                  Remover
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setLinkingId(item.id)}
                  >
                    <Link2 className="size-4" />
                    Vincular à aula
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground"
                    aria-label="Remover vídeo"
                    disabled={deleteVideo.isPending}
                    onClick={() => deleteVideo.mutate(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {linkingId && (
        <LinkLessonDialog
          videoAssetId={linkingId}
          open={!!linkingId}
          onOpenChange={(open) => !open && setLinkingId(null)}
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vídeo vinculado?</AlertDialogTitle>
            <AlertDialogDescription>
              Este vídeo está vinculado à aula “{deleting?.lesson?.title}”. Ao remover, a aula ficará sem vídeo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteVideo.isPending}
              onClick={confirmDelete}
              className="gap-1.5"
            >
              {deleteVideo.isPending && <Spinner />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
