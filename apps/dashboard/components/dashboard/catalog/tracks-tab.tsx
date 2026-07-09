"use client"

import { BookOpen, Layers, ListChecks, Pencil, Plus, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ConfirmDelete } from "@/components/dashboard/course-detail/confirm-delete"
import { TrackFormDialog } from "@/components/dashboard/catalog/track-form-dialog"
import { TrackCoursesDialog } from "@/components/dashboard/catalog/track-courses-dialog"
import { FluentEmoji } from "@/components/dashboard/catalog/fluent-emoji"
import { useDeleteTrack, useTracks } from "@/hooks/use-tracks"
import { trackLevelLabel, type Track } from "@/services/tracks"

const TrackCard = ({ track }: { track: Track }) => {
  const deleteTrack = useDeleteTrack()

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative flex aspect-video items-center justify-center bg-muted">
        {track.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.coverImage} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <Layers className="size-8 text-muted-foreground" />
        )}
        <Badge
          variant={track.status === "PUBLISHED" ? "default" : "secondary"}
          className="absolute top-2 right-2"
        >
          {track.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 font-medium">
            {track.icon && <FluentEmoji char={track.icon} size={20} className="shrink-0" />}
            <span className="truncate">{track.title}</span>
          </h3>
          {track.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{track.description}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{trackLevelLabel(track.level)}</Badge>
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <BookOpen className="size-3" />
            {track._count.courses} {track._count.courses === 1 ? "curso" : "cursos"}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-2 border-t pt-3">
          <TrackCoursesDialog
            track={track}
            trigger={
              <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                <ListChecks className="size-4" />
                Cursos
              </Button>
            }
          />
          <TrackFormDialog
            track={track}
            trigger={
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Editar trilha">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <ConfirmDelete
            trigger={
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Excluir trilha">
                <Trash2 className="size-4" />
              </Button>
            }
            title="Excluir trilha"
            description={`Tem certeza que deseja excluir a trilha "${track.title}"? Esta ação não pode ser desfeita.`}
            onConfirm={() => deleteTrack.mutate(track.id)}
            loading={deleteTrack.isPending}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export const TracksTab = () => {
  const { data: tracks, isLoading } = useTracks()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Trilhas</h2>
          <p className="text-sm text-muted-foreground">
            Agrupe cursos em jornadas de aprendizado para os seus alunos.
          </p>
        </div>
        <TrackFormDialog
          trigger={
            <Button className="gap-1.5">
              <Plus className="size-4" />
              Nova trilha
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : !tracks || tracks.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nenhuma trilha ainda"
          description="Crie a primeira trilha para organizar cursos numa sequência."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  )
}
