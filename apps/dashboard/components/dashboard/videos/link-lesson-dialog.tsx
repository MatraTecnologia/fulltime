"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useInstructorCourses } from "@/hooks/use-courses"
import { useLinkVideo } from "@/hooks/use-videos"
import { getCourseBySlug } from "@/services/courses-detail"

export const LinkLessonDialog = ({
  videoAssetId,
  open,
  onOpenChange,
}: {
  videoAssetId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const [courseSlug, setCourseSlug] = React.useState("")
  const [lessonId, setLessonId] = React.useState("")

  const { data: courses } = useInstructorCourses()
  const { data: course, isFetching } = useQuery({
    queryKey: ["course", courseSlug],
    queryFn: () => getCourseBySlug(courseSlug),
    enabled: !!courseSlug,
  })
  const link = useLinkVideo()

  const courseItems = Object.fromEntries((courses ?? []).map((c) => [c.slug, c.title]))
  const lessons = (course?.modules ?? []).flatMap((m) =>
    m.lessons.map((l) => ({
      id: l.id,
      label: `${m.title} · ${l.title}${l.videoSource === "MUX" ? " (já tem vídeo)" : ""}`,
    }))
  )
  const lessonItems = Object.fromEntries(lessons.map((l) => [l.id, l.label]))

  const handleLink = () => {
    if (!lessonId) return
    link.mutate(
      { lessonId, videoAssetId },
      {
        onSuccess: () => {
          onOpenChange(false)
          setCourseSlug("")
          setLessonId("")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular vídeo a uma aula</DialogTitle>
          <DialogDescription>Escolha o curso e a aula que receberá este vídeo.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Curso</Label>
            <Select
              items={courseItems}
              value={courseSlug}
              onValueChange={(value) => {
                setCourseSlug(value as string)
                setLessonId("")
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent>
                {(courses ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Aula</Label>
            <Select
              items={lessonItems}
              value={lessonId}
              onValueChange={(value) => setLessonId(value as string)}
              disabled={!courseSlug || isFetching}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !courseSlug
                      ? "Selecione um curso primeiro"
                      : isFetching
                        ? "Carregando aulas…"
                        : lessons.length === 0
                          ? "Nenhuma aula neste curso"
                          : "Selecione a aula"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleLink} disabled={!lessonId || link.isPending} className="gap-1.5">
            {link.isPending && <Spinner />}
            Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
