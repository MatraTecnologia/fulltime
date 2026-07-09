import type { ExamQuestionType } from '../generated/prisma/client.js'

export type GradingQuestion = {
  id: string
  type: ExamQuestionType
  points: number
  options: { id: string; isCorrect: boolean }[]
}

export const isObjective = (type: ExamQuestionType) => type !== 'ESSAY'

export const hasEssay = (questions: { type: ExamQuestionType }[]) =>
  questions.some((q) => q.type === 'ESSAY')

export const gradeObjectiveQuestion = (question: GradingQuestion, selectedOptionIds: string[]): number => {
  const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id).sort()
  const selected = [...new Set(selectedOptionIds)].sort()
  if (question.type === 'MULTIPLE') {
    const equal = correctIds.length === selected.length && correctIds.every((id, i) => id === selected[i])
    return equal ? question.points : 0
  }
  return selected.length === 1 && correctIds.length === 1 && selected[0] === correctIds[0] ? question.points : 0
}

export const totalPoints = (questions: { points: number }[]) =>
  questions.reduce((sum, q) => sum + q.points, 0)

export const toPercent = (score: number, total: number) =>
  total > 0 ? Math.round((score / total) * 100) : 0

export const computePassed = (score: number, total: number, passingScore: number) =>
  toPercent(score, total) >= passingScore
