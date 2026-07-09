"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getApiErrorMessage } from "@/lib/api"
import {
  createAttachment,
  createCourse,
  createLesson,
  createModule,
  deleteAttachment,
  deleteLesson,
  deleteLessonQuiz,
  deleteModule,
  getCourseBySlug,
  getLesson,
  getLessonQuiz,
  publishCourse,
  saveLessonQuiz,
  updateCourse,
  updateLesson,
  type CreateCourseInput,
  type CreateLessonInput,
  type QuizPayload,
  type UpdateCourseInput,
  type UpdateLessonInput,
} from "@/services/courses-detail"

export const useCourseDetail = (slug: string) =>
  useQuery({
    queryKey: ["course", slug],
    queryFn: () => getCourseBySlug(slug),
  })

export const useCreateCourse = () => {
  const qc = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: CreateCourseInput) => createCourse(input),
    onSuccess: (course) => {
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] })
      toast.success("Curso criado com sucesso.")
      router.push(`/cursos/${course.slug}`)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useUpdateCourse = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseInput }) => updateCourse(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", slug] })
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] })
      toast.success("Alterações salvas.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const usePublishCourse = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => publishCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", slug] })
      qc.invalidateQueries({ queryKey: ["instructor", "courses"] })
      toast.success("Curso publicado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useCreateModule = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ courseId, title, order }: { courseId: string; title: string; order?: number }) =>
      createModule(courseId, { title, order }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", slug] })
      toast.success("Módulo adicionado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteModule = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", slug] })
      toast.success("Módulo excluído.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useCreateLesson = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ moduleId, input }: { moduleId: string; input: CreateLessonInput }) =>
      createLesson(moduleId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", slug] })
      toast.success("Aula adicionada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useUpdateLesson = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLessonInput }) => updateLesson(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["course", slug] })
      qc.invalidateQueries({ queryKey: ["lesson", id] })
      toast.success("Aula atualizada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteLesson = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLesson(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", slug] })
      toast.success("Aula excluída.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useLesson = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["lesson", id],
    queryFn: () => getLesson(id),
    enabled: enabled && !!id,
  })

export const useCreateAttachment = (lessonId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: { name: string; url: string; type?: string }) =>
      createAttachment(lessonId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lesson", lessonId] })
      toast.success("Material adicionado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteAttachment = (lessonId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAttachment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lesson", lessonId] })
      toast.success("Material removido.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useLessonQuiz = (lessonId: string, enabled = true) =>
  useQuery({
    queryKey: ["lesson", lessonId, "quiz"],
    queryFn: () => getLessonQuiz(lessonId),
    enabled: enabled && !!lessonId,
  })

export const useSaveLessonQuiz = (lessonId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: QuizPayload) => saveLessonQuiz(lessonId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lesson", lessonId, "quiz"] })
      toast.success("Atividade salva.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteLessonQuiz = (lessonId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => deleteLessonQuiz(lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lesson", lessonId, "quiz"] })
      toast.success("Atividade excluída.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
