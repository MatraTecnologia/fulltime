"use client"

import * as React from "react"
import { BookOpen, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/dashboard/empty-state"
import { useAddTrackCourse, useRemoveTrackCourse, useTrack } from "@/hooks/use-tracks"
import { useInstructorCourses } from "@/hooks/use-courses"
import type { Track } from "@/services/tracks"

const TrackCoursesManager = ({ track }: { track: Track }) => {
  const { data: detail, isLoading } = useTrack(track.slug)
  const { data: courses } = useInstructorCourses()
  const addCourse = useAddTrackCourse(track.slug)
  const removeCourse = useRemoveTrackCourse(track.slug)

  const [selected, setSelected] = React.useState("")

  const trackCourses = detail?.courses ?? []
  const linkedIds = new Set(trackCourses.map((tc) => tc.course.id))
  const available = (courses ?? []).filter((c) => !linkedIds.has(c.id))
  const availableItems = Object.fromEntries(available.map((c) => [c.id, c.title]))

  const handleAdd = () => {
    if (!selected) return
    addCourse.mutate(
      { trackId: track.id, courseId: selected, order: trackCourses.length },
      { onSuccess: () => setSelected("") }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="grid flex-1 gap-2">
          <Select
            items={availableItems}
            value={selected}
            onValueChange={(value) => setSelected(value as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={available.length ? "Selecione um curso" : "Nenhum curso disponível"} />
            </SelectTrigger>
            <SelectContent>
              {available.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd} disabled={!selected || addCourse.isPending} className="gap-1.5">
          {addCourse.isPending ? <Spinner /> : <Plus className="size-4" />}
          Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : trackCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum curso na trilha"
          description="Adicione cursos para montar a jornada de aprendizado."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {trackCourses.map((tc) => (
            <li key={tc.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
              {tc.course.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tc.course.coverImage}
                  alt=""
                  className="h-9 w-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="size-4.5" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{tc.course.title}</p>
                <p className="text-xs text-muted-foreground">{tc.course.instructor.name}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label="Remover curso da trilha"
                disabled={removeCourse.isPending}
                onClick={() => removeCourse.mutate({ trackId: track.id, courseId: tc.course.id })}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export const TrackCoursesDialog = ({
  track,
  trigger,
}: {
  track: Track
  trigger: React.ReactElement
}) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cursos da trilha</DialogTitle>
          <DialogDescription>{track.title}</DialogDescription>
        </DialogHeader>
        {open && <TrackCoursesManager track={track} />}
      </DialogContent>
    </Dialog>
  )
}
