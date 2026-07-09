"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  type CreateEventInput,
  type EventWhen,
  type UpdateEventInput,
} from "@/services/events"

export const useEvents = (when: EventWhen = "upcoming") =>
  useQuery({
    queryKey: ["events", when],
    queryFn: () => getEvents(when),
  })

export const useCreateEvent = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] })
      toast.success("Evento criado com sucesso.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useUpdateEvent = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEventInput }) => updateEvent(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] })
      toast.success("Alterações salvas.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteEvent = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] })
      toast.success("Evento excluído.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
