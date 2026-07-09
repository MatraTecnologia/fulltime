"use client"

import * as React from "react"
import { ImagePlus, UploadCloud } from "lucide-react"
import { toast } from "sonner"
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
import { useCreateLesson } from "@/hooks/use-course-detail"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"
import { createVideoUpload, getVideoStatus, uploadVideoToMux } from "@/services/videos"
import { extractEmbedId } from "@/lib/video-embed"
import type { CourseModuleNode } from "@/services/courses-detail"

type LessonVideoSource = "MUX" | "YOUTUBE" | "VIMEO"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const parseDuration = (value: string): number | undefined => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parts = trimmed.split(":").map((p) => Number(p))
  if (parts.some((n) => Number.isNaN(n))) return undefined
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 1) return parts[0]
  return undefined
}

export const ContentForm = ({
  modules,
  slug,
  onCreated,
}: {
  modules: CourseModuleNode[]
  slug: string
  onCreated: () => void
}) => {
  const [moduleId, setModuleId] = React.useState(modules[0]?.id ?? "")
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [duration, setDuration] = React.useState("")
  const [thumbnail, setThumbnail] = React.useState("")
  const [uploadingThumbnail, setUploadingThumbnail] = React.useState(false)
  const [videoSource, setVideoSource] = React.useState<LessonVideoSource>("MUX")
  const [videoFile, setVideoFile] = React.useState<File | null>(null)
  const [videoUrl, setVideoUrl] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const thumbnailInputRef = React.useRef<HTMLInputElement>(null)
  const videoInputRef = React.useRef<HTMLInputElement>(null)

  const createLesson = useCreateLesson(slug)

  const moduleItems = Object.fromEntries(modules.map((m) => [m.id, m.title]))
  const targetModule = modules.find((m) => m.id === moduleId)

  const busy = submitting || uploadingThumbnail || createLesson.isPending

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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoFile(e.target.files?.[0] ?? null)
  }

  const pollVideoStatus = async (id: string) => {
    for (let attempt = 0; attempt < 10; attempt++) {
      await sleep(4000)
      try {
        const { status } = await getVideoStatus(id)
        if (status === "READY") {
          toast.success("Vídeo pronto.")
          return
        }
      } catch {
        return
      }
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setDuration("")
    setThumbnail("")
    setVideoSource("MUX")
    setVideoFile(null)
    setVideoUrl("")
  }

  const handleCreate = async () => {
    if (!title.trim() || !moduleId || busy) return

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
      const lesson = await createLesson.mutateAsync({
        moduleId,
        input: {
          title: title.trim(),
          content: content.trim() || undefined,
          thumbnail: thumbnail || undefined,
          durationSec: parseDuration(duration),
          videoSource: embedRef ? videoSource : undefined,
          videoRef: embedRef,
          order: targetModule?.lessons.length,
        },
      })

      if (videoSource === "MUX" && videoFile) {
        try {
          const up = await createVideoUpload({ lessonId: lesson.id, filename: videoFile.name })
          await uploadVideoToMux(up.uploadUrl, videoFile)
          toast.info("Vídeo enviado — processando…")
          void pollVideoStatus(up.id)
        } catch (error) {
          toast.error(getApiErrorMessage(error, "Não foi possível enviar o vídeo. A aula foi criada."))
        }
      }

      resetForm()
      onCreated()
    } catch {
      // erro da criação da aula já é tratado pelo hook via toast
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes da aula</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title">Título da aula</Label>
              <Input
                id="lesson-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Introdução à alfabetização adaptada"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-content">Descrição</Label>
              <Textarea
                id="lesson-content"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva o que o aluno vai aprender nesta aula..."
              />
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
                  onChange={handleVideoChange}
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={busy}
                  className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <UploadCloud className="mb-3 size-9 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {videoFile ? videoFile.name : "Enviar vídeo"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {videoFile
                      ? "O envio começa ao adicionar a aula."
                      : "MP4, MOV ou WEBM · processado automaticamente."}
                  </p>
                </button>
              </>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="lesson-video-url">
                  {videoSource === "YOUTUBE" ? "URL ou ID do YouTube" : "URL ou ID do Vimeo"}
                </Label>
                <Input
                  id="lesson-video-url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder={
                    videoSource === "YOUTUBE"
                      ? "https://youtube.com/watch?v=…"
                      : "https://vimeo.com/…"
                  }
                />
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
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Informações adicionais</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Módulo</Label>
              <Select
                items={moduleItems}
                value={moduleId}
                onValueChange={(value) => setModuleId(value as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson-duration">Duração (mm:ss)</Label>
              <Input
                id="lesson-duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="00:00"
                inputMode="numeric"
              />
            </div>

            <div className="mt-2 flex flex-col gap-2 border-t pt-4">
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={!title.trim() || !moduleId || busy}
              >
                {busy && <Spinner />}
                Adicionar aula
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
