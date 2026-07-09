import { prisma } from './prisma.js'

export const areRequiredExamsPassed = async (userId: string, courseId: string): Promise<boolean> => {
  const exams = await prisma.exam.findMany({
    where: { courseId, status: 'PUBLISHED' },
    select: { id: true },
  })
  if (exams.length === 0) return true

  const passed = await prisma.examAttempt.findMany({
    where: { userId, examId: { in: exams.map((e) => e.id) }, passed: true },
    select: { examId: true },
  })
  const passedSet = new Set(passed.map((p) => p.examId))
  return exams.every((e) => passedSet.has(e.id))
}
