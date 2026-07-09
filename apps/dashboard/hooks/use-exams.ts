"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import {
  createExam,
  deleteExam,
  getCourseExams,
  getExam,
  replaceExamQuestions,
  updateExam,
  type CreateExamInput,
  type ExamQuestionInput,
  type UpdateExamInput,
} from "@/services/exams"

export const useCourseExams = (courseId: string) =>
  useQuery({
    queryKey: ["exams", courseId],
    queryFn: () => getCourseExams(courseId),
    enabled: !!courseId,
  })

export const useExam = (id: string, enabled = true) =>
  useQuery({
    queryKey: ["exam", id],
    queryFn: () => getExam(id),
    enabled: enabled && !!id,
  })

export const useCreateExam = (courseId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateExamInput) => createExam(courseId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams", courseId] })
      toast.success("Prova criada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useUpdateExam = (courseId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExamInput }) => updateExam(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["exams", courseId] })
      qc.invalidateQueries({ queryKey: ["exam", id] })
      toast.success("Prova atualizada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteExam = (courseId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exams", courseId] })
      toast.success("Prova excluída.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useReplaceExamQuestions = (courseId: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, questions }: { id: string; questions: ExamQuestionInput[] }) =>
      replaceExamQuestions(id, questions),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["exams", courseId] })
      qc.invalidateQueries({ queryKey: ["exam", id] })
      toast.success("Questões salvas.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
