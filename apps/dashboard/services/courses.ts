import { api } from "@/lib/api"
import type { CourseRow, CourseStatus } from "@/types"

export interface ApiInstructorCourse {
  id: string
  slug: string
  title: string
  coverImage: string | null
  status: CourseStatus
  lessons: number
  students: number
  completionRate: number
  rating: number
  durationLabel: string
  updatedAt: string
  categories: { id: string; slug: string; name: string }[]
}

export const getInstructorCourses = async (): Promise<ApiInstructorCourse[]> => {
  const { data } = await api.get<ApiInstructorCourse[]>("/instructor/courses")
  return data
}

const statusLabel = (status: CourseStatus) =>
  status === "PUBLISHED" ? "Publicado" : status === "ARCHIVED" ? "Arquivado" : "Rascunho"

export const toCourseRow = (course: ApiInstructorCourse): CourseRow => ({
  id: course.id,
  slug: course.slug,
  title: course.title,
  thumbnailUrl: course.coverImage,
  status: course.status,
  lessons: course.lessons,
  students: course.students,
  rating: course.rating,
  completionRate: course.completionRate,
  durationLabel: course.durationLabel,
  updatedAtLabel: `${statusLabel(course.status)} · ${new Date(course.updatedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`,
})
