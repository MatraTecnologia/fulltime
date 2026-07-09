"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ImagePlus, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LessonMaterialsSection } from "@/components/dashboard/course-detail/lesson-materials-section"
import { useLesson, useUpdateLesson } from "@/hooks/use-course-detail"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"
import { createVideoUpload, getVideoStatus, uploadVideoToMux } from "@/services/videos"
import { extractEmbedId } from "@/lib/video-embed"
import type { CourseLessonNode } from "@/services/courses-detail"

type LessonVideoSource = "MUX" | "YOUTUBE" | "VIMEO"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const EditLessonSheet = ({
  lesson,
  slug,
  open,
  onOpenChange,
}: {
  lesson: CourseLessonNode
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const qc = useQueryClient()
  const updateLesson = useUpdateLesson(slug)
  const lessonDetail = useLesson(lesson.id, open)

  const [title, setTitle] = React.useState(lesson.title)
  const [content, setContent] = React.useState("")
  const [transcript, setTranscript] = React.useState("")
  const [thumbnail, setThumbnail] = React.useState(lesson.thumbnail ?? "")
  const [uploadingThumbnail, setUploadingThumbnail] = React.useState(false)
  const [videoSource, setVideoSource] = React.useState<LessonVideoSource>(
    lesson.videoSource === "YOUTUBE" || lesson.videoSource === "VIMEO" ? lesson.videoSource : "MUX"
  )
  const [videoFile, setVideoFile] = React.useState<File | null>(null)
  const [videoUrl, setVideoUrl] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const [loaded, setLoaded] = React.useState(false)

  const thumbnailInputRef = React.useRef<HTMLInputElement>(null)
  const videoInputRef = React.useRef<HTMLInputElement>(null)

  if (!loaded && lessonDetail.data) {
    setLoaded(true)
    setContent(lessonDetail.data.content ?? "")
    setTranscript(lessonDetail.data.transcript ?? "")
  }

  const busy = submitting || uploadingThumbnail || updateLesson.isPending

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadingThumbnail(true)
    try {
      const url = await uploadImage(file)
      setThumbnail(url)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const pollVideoStatus = async (id: string) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      await sleep(4000)
      try {
        const { status } = await getVideoStatus(id)
        if (status === "READY") {
          toast.success("Vídeo pronto.")
          qc.invalidateQueries({ queryKey: ["course", slug] })
          return
        }
      } catch {
        return
      }
    }
  }

  const handleSave = async () => {
    if (!title.trim() || busy) return

    let embedRef: string | undefined
    if (videoSource !== "MUX" && videoUrl.trim()) {
      const id = extractEmbedId(videoSource, videoUrl)
      if (!id) {
        toast.error("URL de vídeo inválida.")
        return
      }
      embedRef = id
    }

    setSubmitting(true)
    try {
      await updateLesson.mutateAsync({
        id: lesson.id,
        input: {
          title: title.trim(),
          content: loaded ? content.trim() : undefined,
          transcript: loaded ? transcript.trim() : undefined,
          thumbnail: thumbnail || undefined,
          videoSource: embedRef ? videoSource : undefined,
          videoRef: embedRef,
        },
      })

      if (videoSource === "MUX" && videoFile) {
        try {
          const up = await createVideoUpload({ lessonId: lesson.id, filename: videoFile.name })
          await uploadVideoToMux(up.uploadUrl, videoFile)
          toast.info("Vídeo enviado — processando…")
          void pollVideoStatus(up.id)
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Não foi possível enviar o vídeo."))
        }
      }

      onOpenChange(false)
    } catch {
      // erro do PATCH já é tratado pelo hook via toast
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-none data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle>Editar aula</SheetTitle>
          <SheetDescription>Atualize o título, a miniatura ou troque o vídeo.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes da aula</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-lesson-title">Título da aula</Label>
                <Input
                  id="edit-lesson-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lesson-content">Descrição</Label>
                {lessonDetail.isPending ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : (
                  <Textarea
                    id="edit-lesson-content"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Descreva o que o aluno vai aprender nesta aula..."
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lesson-transcript">Transcrição</Label>
                {lessonDetail.isPending ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : (
                  <Textarea
                    id="edit-lesson-transcript"
                    rows={5}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Cole aqui a transcrição do vídeo da aula..."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vídeo da aula</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label>Fonte do vídeo</Label>
                <Select
                  items={{ MUX: "Upload (processado)", YOUTUBE: "YouTube", VIMEO: "Vimeo" }}
                  value={videoSource}
                  onValueChange={(value) => setVideoSource(value as LessonVideoSource)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MUX">Upload (processado)</SelectItem>
                    <SelectItem value="YOUTUBE">YouTube (embed)</SelectItem>
                    <SelectItem value="VIMEO">Vimeo (embed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {videoSource === "MUX" ? (
                <>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={busy}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <UploadCloud className="mb-3 size-9 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {videoFile
                        ? videoFile.name
                        : lesson.videoSource === "MUX"
                          ? "Substituir vídeo"
                          : "Enviar vídeo"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {videoFile
                        ? "O envio começa ao salvar."
                        : lesson.videoSource === "MUX"
                          ? "Já existe um vídeo vinculado · enviar substitui o atual."
                          : "MP4, MOV ou WEBM · processado automaticamente."}
                    </p>
                  </button>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="edit-lesson-video-url">
                    {videoSource === "YOUTUBE" ? "URL ou ID do YouTube" : "URL ou ID do Vimeo"}
                  </Label>
                  <Input
                    id="edit-lesson-video-url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={
                      videoSource === "YOUTUBE"
                        ? "https://youtube.com/watch?v=…"
                        : "https://vimeo.com/…"
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {lesson.videoSource === videoSource
                      ? "Cole uma nova URL para substituir o vídeo atual."
                      : "Cole a URL para vincular este embed à aula."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Miniatura</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailChange}
              />
              <button
                type="button"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={busy}
                className="relative flex aspect-video w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 disabled:cursor-not-allowed"
              >
                {thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt="Miniatura da aula" className="absolute inset-0 size-full object-cover" />
                )}
                {uploadingThumbnail ? (
                  <Spinner />
                ) : thumbnail ? (
                  <span className="relative z-10 rounded-md bg-background/80 px-2 py-1 text-xs">Trocar imagem</span>
                ) : (
                  <>
                    <ImagePlus className="mb-1 size-7" />
                    <span className="text-xs">Enviar miniatura</span>
                    <span className="text-[0.7rem] text-muted-foreground/70">JPG ou PNG · 1280×720</span>
                  </>
                )}
              </button>
            </CardContent>
          </Card>

          <LessonMaterialsSection
            lessonId={lesson.id}
            attachments={lessonDetail.data?.attachments ?? []}
            loading={lessonDetail.isPending}
          />
        </div>

        <SheetFooter className="border-t p-5">
          <Button onClick={handleSave} disabled={!title.trim() || busy} className="gap-1.5">
            {busy && <Spinner />}
            Salvar alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
