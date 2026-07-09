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
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"
import { useCreateEvent, useUpdateEvent } from "@/hooks/use-events"
import type { EventItem, EventStatus, EventType } from "@/services/events"

const typeItems: Record<EventType, string> = {
  WEBINAR: "Webinar",
  LIVE: "Live",
  WORKSHOP: "Workshop",
}

const statusItems: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
}

const toLocalInput = (iso: string): string => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const EventForm = ({ event, onDone }: { event?: EventItem; onDone: () => void }) => {
  const [title, setTitle] = React.useState(event?.title ?? "")
  const [slug, setSlug] = React.useState(event?.slug ?? "")
  const [description, setDescription] = React.useState(event?.description ?? "")
  const [type, setType] = React.useState<EventType>(event?.type ?? "WEBINAR")
  const [status, setStatus] = React.useState<EventStatus>(event?.status ?? "DRAFT")
  const [startsAt, setStartsAt] = React.useState(event ? toLocalInput(event.startsAt) : "")
  const [durationMin, setDurationMin] = React.useState(event?.durationMin ? String(event.durationMin) : "")
  const [url, setUrl] = React.useState(event?.url ?? "")
  const [coverImage, setCoverImage] = React.useState(event?.coverImage ?? "")
  const [uploadingCover, setUploadingCover] = React.useState(false)

  const coverInputRef = React.useRef<HTMLInputElement>(null)

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()

  const busy = uploadingCover || createEvent.isPending || updateEvent.isPending

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadingCover(true)
    try {
      const uploaded = await uploadImage(file)
      setCoverImage(uploaded)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSubmit = () => {
    if (!title.trim() || !startsAt || busy) return

    const startsAtIso = new Date(startsAt).toISOString()
    const duration = durationMin.trim() ? Number(durationMin) : undefined

    if (event) {
      updateEvent.mutate(
        {
          id: event.id,
          input: {
            title: title.trim(),
            slug: slug.trim() || undefined,
            description: description.trim() || undefined,
            type,
            status,
            startsAt: startsAtIso,
            durationMin: duration,
            url: url.trim() || undefined,
            coverImage: coverImage || null,
          },
        },
        { onSuccess: onDone }
      )
      return
    }

    createEvent.mutate(
      {
        title: title.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        type,
        startsAt: startsAtIso,
        durationMin: duration,
        url: url.trim() || undefined,
        coverImage: coverImage || undefined,
      },
      { onSuccess: onDone }
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{event ? "Editar evento" : "Novo evento"}</DialogTitle>
        <DialogDescription>
          {event
            ? "Atualize as informações do evento."
            : "Preencha os dados para criar um novo evento."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="event-title">Título</Label>
          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Live sobre inclusão escolar"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="event-slug">Slug (opcional)</Label>
          <Input
            id="event-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="gerado a partir do título"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="event-description">Descrição</Label>
          <Textarea
            id="event-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sobre o que é este evento..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select items={typeItems} value={type} onValueChange={(value) => setType(value as EventType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(typeItems) as EventType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {typeItems[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {event && (
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                items={statusItems}
                value={status}
                onValueChange={(value) => setStatus(value as EventStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusItems) as EventStatus[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {statusItems[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="event-starts-at">Data e hora</Label>
            <Input
              id="event-starts-at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-duration">Duração (min)</Label>
            <Input
              id="event-duration"
              type="number"
              min={0}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="60"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="event-url">URL da transmissão</Label>
          <Input
            id="event-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
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
            disabled={busy}
            className="relative flex aspect-video w-full max-w-xs flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 disabled:cursor-not-allowed"
          >
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="Capa do evento" className="absolute inset-0 size-full object-cover" />
            )}
            {uploadingCover ? (
              <Spinner />
            ) : coverImage ? (
              <span className="relative z-10 rounded-md bg-background/80 px-2 py-1 text-xs">Trocar imagem</span>
            ) : (
              <>
                <ImagePlus className="mb-1 size-7" />
                <span className="text-xs">Enviar capa</span>
                <span className="text-[0.7rem] text-muted-foreground/70">JPG ou PNG · 1280×720</span>
              </>
            )}
          </button>
        </div>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
        <Button onClick={handleSubmit} disabled={!title.trim() || !startsAt || busy}>
          {busy && <Spinner />}
          {event ? "Salvar" : "Criar evento"}
        </Button>
      </DialogFooter>
    </>
  )
}

export const EventFormDialog = ({
  trigger,
  event,
}: {
  trigger: React.ReactElement
  event?: EventItem
}) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {open && <EventForm event={event} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}
