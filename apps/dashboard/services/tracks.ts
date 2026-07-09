import { api } from "@/lib/api"
import type { CourseStatus } from "@/types"

export type TrackLevel = "INICIANTE" | "INTERMEDIARIO" | "AVANCADO"
export type TrackStatus = "DRAFT" | "PUBLISHED"

export interface Track {
  id: string
  slug: string
  title: string
  description: string | null
  coverImage: string | null
  color: string | null
  icon: string | null
  level: TrackLevel
  status: TrackStatus
  _count: { courses: number }
}

export interface TrackCourseNode {
  id: string
  order: number
  course: {
    id: string
    slug: string
    title: string
    coverImage: string | null
    status: CourseStatus
    instructor: { id: string; name: string }
    _count: { modules: number }
  }
}

export interface TrackDetail {
  id: string
  slug: string
  title: string
  description: string | null
  coverImage: string | null
  color: string | null
  icon: string | null
  level: TrackLevel
  status: TrackStatus
  courses: TrackCourseNode[]
}

export interface CreateTrackInput {
  title: string
  slug?: string
  description?: string
  coverImage?: string | null
  color?: string | null
  icon?: string | null
  level?: TrackLevel
  status?: TrackStatus
}

export interface UpdateTrackInput {
  title?: string
  slug?: string
  description?: string
  coverImage?: string | null
  color?: string | null
  icon?: string | null
  level?: TrackLevel
  status?: TrackStatus
}

export const getTracks = async (): Promise<Track[]> => {
  const [draft, published] = await Promise.all([
    api.get<Track[]>("/tracks", { params: { status: "DRAFT" } }),
    api.get<Track[]>("/tracks", { params: { status: "PUBLISHED" } }),
  ])
  return [...draft.data, ...published.data]
}

export const getTrack = async (slug: string): Promise<TrackDetail> => {
  const { data } = await api.get<TrackDetail>(`/tracks/${slug}`)
  return data
}

export const createTrack = async (input: CreateTrackInput): Promise<Track> => {
  const { data } = await api.post<Track>("/tracks", input)
  return data
}

export const updateTrack = async (id: string, input: UpdateTrackInput): Promise<Track> => {
  const { data } = await api.patch<Track>(`/tracks/${id}`, input)
  return data
}

export const deleteTrack = async (id: string): Promise<void> => {
  await api.delete(`/tracks/${id}`)
}

export const addTrackCourse = async (
  trackId: string,
  courseId: string,
  order?: number
): Promise<TrackCourseNode> => {
  const { data } = await api.post<TrackCourseNode>(`/tracks/${trackId}/courses`, { courseId, order })
  return data
}

export const removeTrackCourse = async (trackId: string, courseId: string): Promise<void> => {
  await api.delete(`/tracks/${trackId}/courses/${courseId}`)
}

export const trackLevelLabel = (level: TrackLevel): string =>
  level === "INICIANTE" ? "Iniciante" : level === "INTERMEDIARIO" ? "Intermediário" : "Avançado"
