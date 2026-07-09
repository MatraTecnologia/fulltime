import { api } from "@/lib/api"
import type { CourseStatus } from "@/types"

export type VideoSource = "MUX" | "YOUTUBE" | "VIMEO" | "NONE"

export interface Course {
  id: string
  slug: string
  title: string
  description: string | null
  coverImage: string | null
  status: CourseStatus
  instructor: { id: string; name: string }
}

export interface CourseLessonNode {
  id: string
  title: string
  order: number
  durationSec: number | null
  thumbnail: string | null
  videoSource: VideoSource
}

export interface CourseModuleNode {
  id: string
  title: string
  order: number
  lessons: CourseLessonNode[]
}

export interface CourseDetail extends Course {
  modules: CourseModuleNode[]
}

export interface CreateCourseInput {
  title: string
  description?: string
  coverImage?: string
  slug?: string
}

export interface UpdateCourseInput {
  title?: string
  description?: string
  coverImage?: string | null
  slug?: string
  status?: CourseStatus
}

export interface CreateLessonInput {
  title: string
  content?: string
  thumbnail?: string
  videoSource?: VideoSource
  videoRef?: string
  durationSec?: number
  order?: number
}

export const getCourseBySlug = async (slug: string): Promise<CourseDetail> => {
  const { data } = await api.get<CourseDetail>(`/courses/${slug}`)
  return data
}

export const createCourse = async (input: CreateCourseInput): Promise<Course> => {
  const { data } = await api.post<Course>("/courses", input)
  return data
}

export const updateCourse = async (id: string, input: UpdateCourseInput): Promise<Course> => {
  const { data } = await api.patch<Course>(`/courses/${id}`, input)
  return data
}

export const publishCourse = async (id: string): Promise<Course> => {
  const { data } = await api.post<Course>(`/courses/${id}/publish`)
  return data
}

export const deleteCourse = async (id: string): Promise<void> => {
  await api.delete(`/courses/${id}`)
}

export const createModule = async (
  courseId: string,
  input: { title: string; order?: number }
): Promise<CourseModuleNode> => {
  const { data } = await api.post<CourseModuleNode>(`/courses/${courseId}/modules`, input)
  return data
}

export const updateModule = async (
  id: string,
  input: { title?: string; order?: number }
): Promise<CourseModuleNode> => {
  const { data } = await api.patch<CourseModuleNode>(`/modules/${id}`, input)
  return data
}

export const deleteModule = async (id: string): Promise<void> => {
  await api.delete(`/modules/${id}`)
}

export const createLesson = async (
  moduleId: string,
  input: CreateLessonInput
): Promise<CourseLessonNode> => {
  const { data } = await api.post<CourseLessonNode>(`/modules/${moduleId}/lessons`, input)
  return data
}

export interface UpdateLessonInput {
  title?: string
  content?: string
  thumbnail?: string
  videoSource?: VideoSource
  videoRef?: string
  durationSec?: number
  order?: number
}

export const updateLesson = async (
  id: string,
  input: UpdateLessonInput
): Promise<CourseLessonNode> => {
  const { data } = await api.patch<CourseLessonNode>(`/lessons/${id}`, input)
  return data
}

export const deleteLesson = async (id: string): Promise<void> => {
  await api.delete(`/lessons/${id}`)
}

export const formatDurationSec = (durationSec: number | null): string => {
  if (!durationSec || durationSec <= 0) return "—"
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
