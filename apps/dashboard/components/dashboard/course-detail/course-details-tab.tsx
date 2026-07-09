"use client"

import * as React from "react"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useUpdateCourse } from "@/hooks/use-course-detail"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"
import type { CourseDetail } from "@/services/courses-detail"

export const CourseDetailsTab = ({ course }: { course: CourseDetail }) => {
  const [title, setTitle] = React.useState(course.title)
  const [description, setDescription] = React.useState(course.description ?? "")
  const [coverImage, setCoverImage] = React.useState(course.coverImage ?? "")
  const [uploadingCover, setUploadingCover] = React.useState(false)
  const update = useUpdateCourse(course.slug)

  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadImage(file)
      setCoverImage(url)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSave = () => {
    if (!title.trim()) return
    update.mutate({
      id: course.id,
      input: {
        title: title.trim(),
        description: description.trim() || undefined,
        coverImage: coverImage || null,
      },
    })
  }

  const busy = update.isPending || uploadingCover

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do curso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="detail-title">Título</Label>
              <Input id="detail-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="detail-description">Descrição</Label>
              <Textarea
                id="detail-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os objetivos e o público-alvo do curso..."
              />
            </div>
            <div className="flex justify-end border-t pt-4">
              <Button onClick={handleSave} disabled={!title.trim() || busy} className="gap-1.5">
                {busy && <Spinner />}
                Salvar alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Capa do curso</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={busy}
              className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 disabled:cursor-not-allowed"
            >
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="Capa do curso" className="absolute inset-0 size-full object-cover" />
              )}
              {uploadingCover ? (
                <Spinner />
              ) : coverImage ? (
                <span className="relative z-10 rounded-md bg-background/80 px-2 py-1 text-xs">Trocar imagem</span>
              ) : (
                <>
                  <ImagePlus className="mb-1 size-7" />
                  <span className="text-xs">Enviar imagem de capa</span>
                  <span className="text-[0.7rem] text-muted-foreground/70">JPG ou PNG · 1280×720</span>
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
