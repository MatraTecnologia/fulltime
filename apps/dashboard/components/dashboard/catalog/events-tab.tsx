"use client"

import * as React from "react"
import { CalendarDays, Clock, Pencil, Plus, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ConfirmDelete } from "@/components/dashboard/course-detail/confirm-delete"
import { EventFormDialog } from "@/components/dashboard/catalog/event-form-dialog"
import { useDeleteEvent, useEvents } from "@/hooks/use-events"
import type { EventItem, EventStatus, EventType, EventWhen } from "@/services/events"

const typeLabels: Record<EventType, string> = {
  WEBINAR: "Webinar",
  LIVE: "Live",
  WORKSHOP: "Workshop",
}

const statusLabels: Record<EventStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const formatDateTime = (iso: string) => dateFormatter.format(new Date(iso))

const EventCard = ({ event }: { event: EventItem }) => {
  const deleteEvent = useDeleteEvent()

  return (
    <li className="flex items-center gap-4 rounded-xl border bg-card p-4">
      {event.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.coverImage}
          alt=""
          className="hidden h-16 w-28 shrink-0 rounded-lg object-cover sm:block"
        />
      ) : (
        <span className="hidden size-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
          <CalendarDays className="size-6" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{event.title}</p>
          <Badge variant="secondary" className="text-[0.7rem]">
            {typeLabels[event.type]}
          </Badge>
          <Badge
            variant={event.status === "PUBLISHED" ? "default" : "outline"}
            className="text-[0.7rem]"
          >
            {statusLabels[event.status]}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {formatDateTime(event.startsAt)}
          </span>
          {event.durationMin ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {event.durationMin} min
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {event._count.registrations} inscritos
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <EventFormDialog
          event={event}
          trigger={
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Editar evento">
              <Pencil className="size-4" />
            </Button>
          }
        />
        <ConfirmDelete
          title="Excluir evento"
          description={`Tem certeza que deseja excluir "${event.title}"? Esta ação não pode ser desfeita.`}
          loading={deleteEvent.isPending}
          onConfirm={() => deleteEvent.mutate(event.id)}
          trigger={
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Excluir evento">
              <Trash2 className="size-4" />
            </Button>
          }
        />
      </div>
    </li>
  )
}

export const EventsTab = () => {
  const [when, setWhen] = React.useState<EventWhen>("upcoming")
  const { data: events, isLoading } = useEvents(when)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Eventos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie webinars, lives e workshops da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border p-0.5">
            <Button
              variant={when === "upcoming" ? "secondary" : "ghost"}
              size="sm"
              className="h-7"
              onClick={() => setWhen("upcoming")}
            >
              Próximos
            </Button>
            <Button
              variant={when === "past" ? "secondary" : "ghost"}
              size="sm"
              className="h-7"
              onClick={() => setWhen("past")}
            >
              Passados
            </Button>
          </div>
          <EventFormDialog
            trigger={
              <Button className="gap-1.5">
                <Plus className="size-4" />
                Novo evento
              </Button>
            }
          />
        </div>
      </div>

      {isLoading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 rounded-xl border bg-card p-4">
              <Skeleton className="hidden h-16 w-28 shrink-0 sm:block" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </li>
          ))}
        </ul>
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={when === "upcoming" ? "Nenhum evento agendado" : "Nenhum evento passado"}
          description={
            when === "upcoming"
              ? "Crie um evento para engajar seus alunos com webinars, lives e workshops."
              : "Eventos já realizados aparecerão aqui."
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </ul>
      )}
    </div>
  )
}
