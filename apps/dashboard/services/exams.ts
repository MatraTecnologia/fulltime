import { api } from "@/lib/api"

export type ExamStatus = "DRAFT" | "PUBLISHED"
export type ExamQuestionType = "SINGLE" | "MULTIPLE" | "TRUE_FALSE" | "ESSAY"

export interface Exam {
  id: string
  courseId: string
  moduleId: string | null
  title: string
  description: string | null
  passingScore: number
  maxAttempts: number | null
  status: ExamStatus
  module: { id: string; title: string } | null
  _count: { questions: number }
}

export interface ExamOption {
  id: string
  text: string
  isCorrect: boolean
  order: number
}

export interface ExamQuestion {
  id: string
  type: ExamQuestionType
  prompt: string
  order: number
  points: number
  options: ExamOption[]
}

export interface ExamDetail extends Exam {
  questions: ExamQuestion[]
}

export interface ExamOptionInput {
  text: string
  isCorrect: boolean
  order?: number
}

export interface ExamQuestionInput {
  type: ExamQuestionType
  prompt: string
  order?: number
  points?: number
  options?: ExamOptionInput[]
}

export interface CreateExamInput {
  moduleId?: string | null
  title: string
  description?: string
  passingScore?: number
  maxAttempts?: number | null
  status?: ExamStatus
  questions: ExamQuestionInput[]
}

export interface UpdateExamInput {
  title?: string
  description?: string
  passingScore?: number
  maxAttempts?: number | null
  status?: ExamStatus
}

export const getCourseExams = async (courseId: string): Promise<Exam[]> => {
  const { data } = await api.get<Exam[]>(`/courses/${courseId}/exams`)
  return data
}

export const getExam = async (id: string): Promise<ExamDetail> => {
  const { data } = await api.get<ExamDetail>(`/exams/${id}`)
  return data
}

export const createExam = async (courseId: string, input: CreateExamInput): Promise<Exam> => {
  const { data } = await api.post<Exam>(`/courses/${courseId}/exams`, input)
  return data
}

export const updateExam = async (id: string, input: UpdateExamInput): Promise<Exam> => {
  const { data } = await api.patch<Exam>(`/exams/${id}`, input)
  return data
}

export const deleteExam = async (id: string): Promise<void> => {
  await api.delete(`/exams/${id}`)
}

export const replaceExamQuestions = async (id: string, questions: ExamQuestionInput[]): Promise<void> => {
  await api.put(`/exams/${id}/questions`, { questions })
}
