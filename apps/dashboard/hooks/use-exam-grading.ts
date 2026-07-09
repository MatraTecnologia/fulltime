"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import {
  getGradingAttempt,
  getGradingQueue,
  submitGrades,
  type GradeInput,
} from "@/services/exam-grading"

export const useGradingQueue = () =>
  useQuery({
    queryKey: ["grading-queue"],
    queryFn: getGradingQueue,
  })

export const useGradingAttempt = (attemptId: string, enabled: boolean) =>
  useQuery({
    queryKey: ["grading-attempt", attemptId],
    queryFn: () => getGradingAttempt(attemptId),
    enabled,
  })

export const useSubmitGrades = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ attemptId, grades }: { attemptId: string; grades: GradeInput[] }) =>
      submitGrades(attemptId, grades),
    onSuccess: (_data, { attemptId }) => {
      qc.invalidateQueries({ queryKey: ["grading-queue"] })
      qc.invalidateQueries({ queryKey: ["grading-attempt", attemptId] })
      toast.success("Correção enviada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
