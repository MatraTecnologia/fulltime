"use client"

import * as React from "react"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { EmojiPicker } from "@/components/dashboard/catalog/emoji-picker"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateTrack, useUpdateTrack } from "@/hooks/use-tracks"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"
import type { Track, TrackLevel, TrackStatus } from "@/services/tracks"

const levelItems: Record<TrackLevel, string> = {
  INICIANTE: "Iniciante",
  INTERMEDIARIO: "Intermediário",
  AVANCADO: "Avançado",
}

const statusItems: Record<TrackStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
}

const TrackFormBody = ({ track, onDone }: { track?: Track; onDone: () => void }) => {
  const [title, setTitle] = React.useState(track?.title ?? "")
  const [slug, setSlug] = React.useState(track?.slug ?? "")
  const [description, setDescription] = React.useState(track?.description ?? "")
  const [level, setLevel] = React.useState<TrackLevel>(track?.level ?? "INICIANTE")
  const [status, setStatus] = React.useState<TrackStatus>(track?.status ?? "DRAFT")
  const [color, setColor] = React.useState(track?.color ?? "")
  const [icon, setIcon] = React.useState(track?.icon ?? "")
  const [coverImage, setCoverImage] = React.useState(track?.coverImage ?? "")
  const [uploadingCover, setUploadingCover] = React.useState(false)

  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const createTrack = useCreateTrack()
  const updateTrack = useUpdateTrack()

  const busy = uploadingCover || createTrack.isPending || updateTrack.isPending

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

  const handleSubmit = async () => {
    if (!title.trim() || busy) return

    const input = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      level,
      status,
      color: color.trim() || null,
      icon: icon.trim() || null,
      coverImage: coverImage || null,
    }

    try {
      if (track) {
        await updateTrack.mutateAsync({ id: track.id, input })
      } else {
        const created = await createTrack.mutateAsync(input)
        if (status === "PUBLISHED") {
          await updateTrack.mutateAsync({ id: created.id, input: { status: "PUBLISHED" } })
        }
      }
      onDone()
    } catch {
      // erro já tratado pelos hooks via toast
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="track-title">Título</Label>
            <Input
              id="track-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Trilha de Alfabetização Inclusiva"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="track-slug">Slug</Label>
            <Input
              id="track-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="gerado a partir do título se vazio"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="track-description">Descrição</Label>
            <Textarea
              id="track-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo da trilha..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Nível</Label>
              <Select
                items={levelItems}
                value={level}
                onValueChange={(value) => setLevel(value as TrackLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(levelItems) as TrackLevel[]).map((l) => (
                    <SelectItem key={l} value={l}>
                      {levelItems[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                items={statusItems}
                value={status}
                onValueChange={(value) => setStatus(value as TrackStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusItems) as TrackStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusItems[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="track-color">Cor</Label>
              <Input
                id="track-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#22c55e"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ícone</Label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Capa</Label>
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
                <img src={coverImage} alt="Capa da trilha" className="absolute inset-0 size-full object-cover" />
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
          </div>
        </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
        <Button onClick={handleSubmit} disabled={!title.trim() || busy}>
          {busy && <Spinner />}
          {track ? "Salvar" : "Criar trilha"}
        </Button>
      </DialogFooter>
    </>
  )
}

export const TrackFormDialog = ({
  trigger,
  track,
}: {
  trigger: React.ReactElement
  track?: Track
}) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{track ? "Editar trilha" : "Nova trilha"}</DialogTitle>
          <DialogDescription>
            {track
              ? "Atualize as informações da trilha."
              : "Agrupe cursos numa jornada de aprendizado."}
          </DialogDescription>
        </DialogHeader>
        {open && <TrackFormBody track={track} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}
