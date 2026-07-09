import { api } from "@/lib/api"

export type EventType = "WEBINAR" | "LIVE" | "WORKSHOP"
export type EventStatus = "DRAFT" | "PUBLISHED"
export type EventWhen = "upcoming" | "past"

export interface EventItem {
  id: string
  slug: string
  title: string
  description: string | null
  type: EventType
  status: EventStatus
  startsAt: string
  durationMin: number | null
  url: string | null
  coverImage: string | null
  _count: { registrations: number }
}

export interface CreateEventInput {
  title: string
  startsAt: string
  slug?: string
  description?: string
  type?: EventType
  durationMin?: number
  url?: string
  coverImage?: string | null
}

export interface UpdateEventInput {
  title?: string
  slug?: string
  description?: string
  type?: EventType
  status?: EventStatus
  startsAt?: string
  durationMin?: number
  url?: string
  coverImage?: string | null
}

export const getEvents = async (when: EventWhen = "upcoming"): Promise<EventItem[]> => {
  const [published, drafts] = await Promise.all([
    api.get<EventItem[]>("/events", { params: { when, status: "PUBLISHED" } }),
    api.get<EventItem[]>("/events", { params: { when, status: "DRAFT" } }),
  ])
  return [...published.data, ...drafts.data].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  )
}

export const createEvent = async (input: CreateEventInput): Promise<EventItem> => {
  const { data } = await api.post<EventItem>("/events", input)
  return data
}

export const updateEvent = async (id: string, input: UpdateEventInput): Promise<EventItem> => {
  const { data } = await api.patch<EventItem>(`/events/${id}`, input)
  return data
}

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`)
}
