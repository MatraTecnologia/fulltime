import axios from "axios"
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
  transcript?: string
  thumbnail?: string
  videoSource?: VideoSource
  videoRef?: string
  durationSec?: number
  order?: number
}

export interface LessonAttachment {
  id: string
  lessonId: string
  name: string
  url: string
  type: string | null
  createdAt: string
  updatedAt: string
}

export interface LessonDetail {
  id: string
  moduleId: string
  title: string
  content: string | null
  transcript: string | null
  thumbnail: string | null
  videoSource: VideoSource
  videoRef: string | null
  durationSec: number | null
  attachments: LessonAttachment[]
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
  transcript?: string
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

export const getLesson = async (id: string): Promise<LessonDetail> => {
  const { data } = await api.get<LessonDetail>(`/lessons/${id}`)
  return data
}

export const createAttachment = async (
  lessonId: string,
  input: { name: string; url: string; type?: string }
): Promise<LessonAttachment> => {
  const { data } = await api.post<LessonAttachment>(`/lessons/${lessonId}/attachments`, input)
  return data
}

export const deleteAttachment = async (id: string): Promise<void> => {
  await api.delete(`/attachments/${id}`)
}

export interface QuizOption {
  id: string
  text: string
  order: number
  isCorrect: boolean
}

export interface QuizQuestion {
  id: string
  statement: string
  order: number
  options: QuizOption[]
}

export interface LessonQuiz {
  id: string
  lessonId: string
  title: string
  questions: QuizQuestion[]
  lastAttempt: unknown
}

export interface QuizPayloadOption {
  text: string
  isCorrect: boolean
  order?: number
}

export interface QuizPayloadQuestion {
  statement: string
  order?: number
  options: QuizPayloadOption[]
}

export interface QuizPayload {
  title: string
  questions: QuizPayloadQuestion[]
}

export const getLessonQuiz = async (lessonId: string): Promise<LessonQuiz | null> => {
  try {
    const { data } = await api.get<LessonQuiz>(`/lessons/${lessonId}/quiz`)
    return data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export const saveLessonQuiz = async (lessonId: string, payload: QuizPayload): Promise<void> => {
  await api.put(`/lessons/${lessonId}/quiz`, payload)
}

export const deleteLessonQuiz = async (lessonId: string): Promise<void> => {
  await api.delete(`/lessons/${lessonId}/quiz`)
}

export const formatDurationSec = (durationSec: number | null): string => {
  if (!durationSec || durationSec <= 0) return "—"
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
