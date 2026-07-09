"use client"

import * as React from "react"
import Link from "next/link"
import { ImagePlus } from "lucide-react"
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
import { useCategories } from "@/hooks/use-categories"
import { useCreateCourse } from "@/hooks/use-course-detail"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"

const courseLevels = ["Iniciante", "Intermediário", "Avançado"]

const asItems = (list: string[]) => Object.fromEntries(list.map((v) => [v, v]))

export const NewCourseForm = () => {
  const [title, setTitle] = React.useState("")
  const [subtitle, setSubtitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [coverImage, setCoverImage] = React.useState("")
  const [uploadingCover, setUploadingCover] = React.useState(false)

  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const { data: categories } = useCategories()
  const createCourse = useCreateCourse()

  const categoryItems = Object.fromEntries((categories ?? []).map((c) => [c.slug, c.name]))

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

  const handleCreate = () => {
    if (!title.trim()) return
    createCourse.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      coverImage: coverImage || undefined,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do curso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course-title">Título do curso</Label>
              <Input
                id="course-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Alfabetização Adaptada: Por Onde Começar"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-subtitle">Subtítulo</Label>
              <Input
                id="course-subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Uma frase que resume a proposta do curso"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">Descrição</Label>
              <Textarea
                id="course-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os objetivos, o público-alvo e o que o aluno será capaz de fazer ao concluir..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select items={categoryItems}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nível</Label>
                <Select items={asItems(courseLevels)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseLevels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Capa do curso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
              disabled={uploadingCover}
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
            <div className="grid gap-2">
              <Label htmlFor="course-price">Preço (R$)</Label>
              <Input id="course-price" placeholder="0,00" inputMode="decimal" />
            </div>
            <div className="mt-1 flex flex-col gap-2 border-t pt-4">
              <Button className="w-full" onClick={handleCreate} disabled={!title.trim() || createCourse.isPending}>
                {createCourse.isPending && <Spinner />}
                Criar curso
              </Button>
              <Button variant="outline" className="w-full" nativeButton={false} render={<Link href="/cursos" />}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
