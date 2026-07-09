import { api } from "@/lib/api"

export type GradingQuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE" | "ESSAY"

export interface GradingQueueItem {
  attemptId: string
  student: string
  examTitle: string
  courseTitle: string
  submittedAt: string
}

export interface GradingOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface GradingQuestion {
  questionId: string
  type: GradingQuestionType
  prompt: string
  points: number
  essayText: string | null
  awardedPoints: number | null
  feedback: string | null
  selectedOptionIds: string[]
  options: GradingOption[]
}

export interface GradingAttempt {
  id: string
  student: string
  status: string
  autoScore: number
  passingScore: number
  examTitle: string
  questions: GradingQuestion[]
}

export interface GradeInput {
  questionId: string
  awardedPoints: number
  feedback?: string
}

export interface GradeResult {
  id: string
  status: "GRADED"
  score: number
  passed: boolean
}

export const getGradingQueue = async (): Promise<GradingQueueItem[]> => {
  const { data } = await api.get<GradingQueueItem[]>("/exams/grading/queue")
  return data
}

export const getGradingAttempt = async (attemptId: string): Promise<GradingAttempt> => {
  const { data } = await api.get<GradingAttempt>(`/exams/attempts/${attemptId}/grade`)
  return data
}

export const submitGrades = async (
  attemptId: string,
  grades: GradeInput[]
): Promise<GradeResult> => {
  const { data } = await api.post<GradeResult>(`/exams/attempts/${attemptId}/grade`, { grades })
  return data
}
