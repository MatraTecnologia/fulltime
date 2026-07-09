import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'
import { validateQuestions, type ExamQuestionInput } from '../../lib/exam.js'
import {
  isObjective,
  hasEssay,
  gradeObjectiveQuestion,
  totalPoints,
  computePassed,
} from '../../lib/exam-grading.js'

type SessionUser = { id: string; role?: string | null }
type SubmitAnswer = { questionId: string; selectedOptionIds?: string[]; essayText?: string }
type GradeInput = { questionId: string; awardedPoints: number; feedback?: string }

const examState = (
  attempts: { examId: string; passed: boolean | null; status: string }[],
  examId: string | undefined,
  status: string | undefined
): 'none' | 'pending' | 'grading' | 'passed' | 'failed' => {
  if (!examId || status !== 'PUBLISHED') return 'none'
  const mine = attempts.filter((a) => a.examId === examId)
  if (mine.some((a) => a.passed === true)) return 'passed'
  if (mine.some((a) => a.status === 'GRADING')) return 'grading'
  return mine.length ? 'failed' : 'pending'
}

const assertCourseOwnership = async (courseId: string, user: SessionUser) => {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } })
  if (!course) return { status: 404, error: 'Curso não encontrado.' }
  if (user.role === 'instrutor' && course.instructorId !== user.id) {
    return { status: 403, error: 'Sem permissão sobre este curso.' }
  }
  return null
}

const loadExamOwnership = async (examId: string, user: SessionUser) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { course: { select: { instructorId: true } } } })
  if (!exam) return { status: 404, error: 'Prova não encontrada.' }
  if (user.role === 'instrutor' && exam.course.instructorId !== user.id) {
    return { status: 403, error: 'Sem permissão sobre esta prova.' }
  }
  return null
}

const questionCreate = (questions: ExamQuestionInput[]) =>
  questions.map((q, qi) => ({
    type: q.type,
    prompt: q.prompt,
    order: q.order ?? qi,
    points: q.points ?? 1,
    options: {
      create: (q.options ?? []).map((o, oi) => ({ text: o.text, isCorrect: o.isCorrect, order: o.order ?? oi })),
    },
  }))

export default async function examRoutes(app: FastifyInstance) {
  const guard = { preHandler: [requireAuth, requireRole('admin', 'instrutor')] }

  app.get('/courses/:courseId/exams', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Lista as provas do curso',
      params: { type: 'object', required: ['courseId'], properties: { courseId: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string }
    const denied = await assertCourseOwnership(courseId, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    return prisma.exam.findMany({
      where: { courseId },
      orderBy: [{ moduleId: 'asc' }, { createdAt: 'asc' }],
      include: {
        module: { select: { id: true, title: true } },
        _count: { select: { questions: true } },
      },
    })
  })

  app.post('/courses/:courseId/exams', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Cria uma prova no curso (de módulo ou final)',
      params: { type: 'object', required: ['courseId'], properties: { courseId: { type: 'string' } } },
      body: {
        type: 'object',
        required: ['title', 'questions'],
        properties: {
          moduleId: { type: ['string', 'null'] },
          title: { type: 'string' },
          description: { type: 'string' },
          passingScore: { type: 'integer', minimum: 0, maximum: 100 },
          maxAttempts: { type: ['integer', 'null'], minimum: 1 },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          questions: { type: 'array' },
        },
      },
    },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string }
    const body = request.body as {
      moduleId?: string | null
      title: string
      description?: string
      passingScore?: number
      maxAttempts?: number | null
      status?: 'DRAFT' | 'PUBLISHED'
      questions: ExamQuestionInput[]
    }

    const denied = await assertCourseOwnership(courseId, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    const invalid = validateQuestions(body.questions)
    if (invalid) return reply.status(400).send({ error: invalid })

    if (body.moduleId == null) {
      const existingFinal = await prisma.exam.findFirst({ where: { courseId, moduleId: null }, select: { id: true } })
      if (existingFinal) return reply.status(409).send({ error: 'Este curso já tem uma prova final.' })
    }

    try {
      const exam = await prisma.exam.create({
        data: {
          courseId,
          moduleId: body.moduleId ?? null,
          title: body.title,
          description: body.description,
          passingScore: body.passingScore ?? 70,
          maxAttempts: body.maxAttempts ?? null,
          status: body.status ?? 'DRAFT',
          questions: { create: questionCreate(body.questions) },
        },
      })
      return reply.status(201).send(exam)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Este módulo já tem uma prova.' })
        if (error.code === 'P2003') return reply.status(404).send({ error: 'Curso ou módulo não encontrado.' })
      }
      throw error
    }
  })

  app.get('/exams/:id', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Detalhe da prova (com gabarito)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    return prisma.exam.findUnique({
      where: { id },
      include: {
        module: { select: { id: true, title: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
      },
    })
  })

  app.patch('/exams/:id', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Atualiza metadados da prova',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          passingScore: { type: 'integer', minimum: 0, maximum: 100 },
          maxAttempts: { type: ['integer', 'null'], minimum: 1 },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    const { title, description, passingScore, maxAttempts, status } = request.body as {
      title?: string; description?: string; passingScore?: number; maxAttempts?: number | null; status?: 'DRAFT' | 'PUBLISHED'
    }
    return prisma.exam.update({
      where: { id },
      data: { title, description, passingScore, maxAttempts, status },
    })
  })

  app.put('/exams/:id/questions', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Substitui as questões da prova',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: { type: 'object', required: ['questions'], properties: { questions: { type: 'array' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    const { questions } = request.body as { questions: ExamQuestionInput[] }
    const invalid = validateQuestions(questions)
    if (invalid) return reply.status(400).send({ error: invalid })

    await prisma.$transaction(async (tx) => {
      await tx.examQuestion.deleteMany({ where: { examId: id } })
      for (const data of questionCreate(questions)) {
        await tx.examQuestion.create({ data: { examId: id, ...data } })
      }
    })
    return reply.status(200).send({ ok: true })
  })

  app.delete('/exams/:id', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Remove a prova',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const denied = await loadExamOwnership(id, request.session.user)
    if (denied) return reply.status(denied.status).send({ error: denied.error })

    try {
      await prisma.exam.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Prova não encontrada.' })
      }
      throw error
    }
  })

  const requireEnrollment = async (userId: string, courseId: string) => {
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      select: { id: true },
    })
    return enrolled != null
  }

  app.get('/exams/:id/player', {
    preHandler: [requireAuth],
    schema: {
      tags: ['exams'],
      summary: 'Prova para o aluno (sem gabarito) + estado de tentativas',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.session.user.id

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } } },
    })
    if (!exam || exam.status !== 'PUBLISHED') return reply.status(404).send({ error: 'Prova não disponível.' })
    if (!(await requireEnrollment(userId, exam.courseId))) {
      return reply.status(403).send({ error: 'Você não está matriculado neste curso.' })
    }

    const attempts = await prisma.examAttempt.findMany({
      where: { examId: id, userId },
      orderBy: { startedAt: 'desc' },
      select: { id: true, status: true, score: true, passed: true, startedAt: true },
    })
    const passed = attempts.some((a) => a.passed === true)
    const canAttempt = !passed && (exam.maxAttempts == null || attempts.length < exam.maxAttempts)

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passingScore: exam.passingScore,
      maxAttempts: exam.maxAttempts,
      questions: exam.questions.map((q) => ({
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
      })),
      attemptsUsed: attempts.length,
      passed,
      canAttempt,
      lastAttempt: attempts[0] ?? null,
    }
  })

  app.post('/exams/:id/attempts', {
    preHandler: [requireAuth],
    schema: {
      tags: ['exams'],
      summary: 'Submete respostas e recebe a correção automática',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: {
        type: 'object',
        required: ['answers'],
        properties: {
          answers: {
            type: 'array',
            items: {
              type: 'object',
              required: ['questionId'],
              properties: {
                questionId: { type: 'string' },
                selectedOptionIds: { type: 'array', items: { type: 'string' } },
                essayText: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.session.user.id
    const { answers } = request.body as { answers: SubmitAnswer[] }

    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { questions: { include: { options: true } } },
    })
    if (!exam || exam.status !== 'PUBLISHED') return reply.status(404).send({ error: 'Prova não disponível.' })
    if (!(await requireEnrollment(userId, exam.courseId))) {
      return reply.status(403).send({ error: 'Você não está matriculado neste curso.' })
    }

    const previous = await prisma.examAttempt.findMany({ where: { examId: id, userId }, select: { passed: true } })
    if (previous.some((a) => a.passed === true)) return reply.status(409).send({ error: 'Você já foi aprovado nesta prova.' })
    if (exam.maxAttempts != null && previous.length >= exam.maxAttempts) {
      return reply.status(409).send({ error: 'Você atingiu o limite de tentativas.' })
    }

    const answerMap = new Map(answers.map((a) => [a.questionId, a]))
    let autoScore = 0
    const answerRows = exam.questions.map((q) => {
      const answer = answerMap.get(q.id)
      const selected = answer?.selectedOptionIds ?? []
      if (isObjective(q.type)) autoScore += gradeObjectiveQuestion(q, selected)
      return { questionId: q.id, selectedOptionIds: selected, essayText: answer?.essayText ?? null }
    })

    const total = totalPoints(exam.questions)
    const essay = hasEssay(exam.questions)
    const now = new Date()
    const attempt = await prisma.examAttempt.create({
      data: {
        examId: id,
        userId,
        attemptNumber: previous.length + 1,
        status: essay ? 'GRADING' : 'GRADED',
        autoScore,
        score: essay ? null : autoScore,
        passed: essay ? null : computePassed(autoScore, total, exam.passingScore),
        submittedAt: now,
        gradedAt: essay ? null : now,
        answers: { create: answerRows },
      },
    })

    return reply.status(201).send({
      id: attempt.id,
      status: attempt.status,
      autoScore,
      totalPoints: total,
      score: attempt.score,
      passed: attempt.passed,
      needsGrading: essay,
      corrections: essay
        ? null
        : exam.questions.filter((q) => isObjective(q.type)).map((q) => ({
            questionId: q.id,
            correctOptionIds: q.options.filter((o) => o.isCorrect).map((o) => o.id),
            earned: gradeObjectiveQuestion(q, answerMap.get(q.id)?.selectedOptionIds ?? []),
          })),
    })
  })

  app.get('/exams/:id/attempts', {
    preHandler: [requireAuth],
    schema: {
      tags: ['exams'],
      summary: 'Histórico de tentativas do aluno na prova',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request) => {
    const { id } = request.params as { id: string }
    return prisma.examAttempt.findMany({
      where: { examId: id, userId: request.session.user.id },
      orderBy: { startedAt: 'desc' },
      select: { id: true, attemptNumber: true, status: true, score: true, passed: true, submittedAt: true },
    })
  })

  app.get('/exams/grading/queue', {
    ...guard,
    schema: { tags: ['exams'], summary: 'Fila de tentativas aguardando correção manual' },
  }, async (request) => {
    const user = request.session.user
    const attempts = await prisma.examAttempt.findMany({
      where: {
        status: 'GRADING',
        ...(user.role === 'instrutor' ? { exam: { course: { instructorId: user.id } } } : {}),
      },
      orderBy: { submittedAt: 'asc' },
      include: {
        user: { select: { name: true } },
        exam: { select: { title: true, course: { select: { title: true } } } },
      },
    })
    return attempts.map((a) => ({
      attemptId: a.id,
      student: a.user.name,
      examTitle: a.exam.title,
      courseTitle: a.exam.course.title,
      submittedAt: a.submittedAt,
    }))
  })

  app.get('/exams/attempts/:attemptId/grade', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Tentativa para correção manual (respostas + gabarito)',
      params: { type: 'object', required: ['attemptId'], properties: { attemptId: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { attemptId } = request.params as { attemptId: string }
    const user = request.session.user
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: { select: { name: true } },
        exam: { include: { course: { select: { instructorId: true } }, questions: { orderBy: { order: 'asc' }, include: { options: true } } } },
        answers: true,
      },
    })
    if (!attempt) return reply.status(404).send({ error: 'Tentativa não encontrada.' })
    if (user.role === 'instrutor' && attempt.exam.course.instructorId !== user.id) {
      return reply.status(403).send({ error: 'Sem permissão sobre esta tentativa.' })
    }

    const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]))
    return {
      id: attempt.id,
      student: attempt.user.name,
      status: attempt.status,
      autoScore: attempt.autoScore,
      passingScore: attempt.exam.passingScore,
      examTitle: attempt.exam.title,
      questions: attempt.exam.questions.map((q) => {
        const answer = answerMap.get(q.id)
        return {
          questionId: q.id,
          type: q.type,
          prompt: q.prompt,
          points: q.points,
          essayText: answer?.essayText ?? null,
          awardedPoints: answer?.awardedPoints ?? null,
          feedback: answer?.feedback ?? null,
          selectedOptionIds: answer?.selectedOptionIds ?? [],
          options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
        }
      }),
    }
  })

  app.post('/exams/attempts/:attemptId/grade', {
    ...guard,
    schema: {
      tags: ['exams'],
      summary: 'Fecha a correção manual das dissertativas',
      params: { type: 'object', required: ['attemptId'], properties: { attemptId: { type: 'string' } } },
      body: {
        type: 'object',
        required: ['grades'],
        properties: {
          grades: {
            type: 'array',
            items: {
              type: 'object',
              required: ['questionId', 'awardedPoints'],
              properties: {
                questionId: { type: 'string' },
                awardedPoints: { type: 'integer', minimum: 0 },
                feedback: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { attemptId } = request.params as { attemptId: string }
    const user = request.session.user
    const { grades } = request.body as { grades: GradeInput[] }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: { include: { course: { select: { instructorId: true } }, questions: true } },
        answers: true,
      },
    })
    if (!attempt) return reply.status(404).send({ error: 'Tentativa não encontrada.' })
    if (user.role === 'instrutor' && attempt.exam.course.instructorId !== user.id) {
      return reply.status(403).send({ error: 'Sem permissão sobre esta tentativa.' })
    }

    const gradeMap = new Map(grades.map((g) => [g.questionId, g]))
    const questionMap = new Map(attempt.exam.questions.map((q) => [q.id, q]))
    let manualScore = 0

    await prisma.$transaction(async (tx) => {
      for (const answer of attempt.answers) {
        const question = questionMap.get(answer.questionId)
        if (question?.type !== 'ESSAY') continue
        const grade = gradeMap.get(answer.questionId)
        const awarded = Math.min(question.points, Math.max(0, grade?.awardedPoints ?? 0))
        manualScore += awarded
        await tx.examAnswer.update({
          where: { id: answer.id },
          data: { awardedPoints: awarded, feedback: grade?.feedback ?? null },
        })
      }
      const total = totalPoints(attempt.exam.questions)
      const score = (attempt.autoScore ?? 0) + manualScore
      await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          manualScore,
          score,
          passed: computePassed(score, total, attempt.exam.passingScore),
          status: 'GRADED',
          gradedAt: new Date(),
        },
      })
    })

    const total = totalPoints(attempt.exam.questions)
    const score = (attempt.autoScore ?? 0) + manualScore
    return { id: attemptId, status: 'GRADED', score, passed: computePassed(score, total, attempt.exam.passingScore) }
  })

  app.get('/courses/:slug/progress', {
    preHandler: [requireAuth],
    schema: {
      tags: ['exams'],
      summary: 'Estado de progressão do curso para o aluno (gate)',
      params: { type: 'object', required: ['slug'], properties: { slug: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const userId = request.session.user.id

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { select: { id: true } }, exam: { select: { id: true, status: true } } },
        },
        exams: { where: { moduleId: null }, select: { id: true, status: true } },
      },
    })
    if (!course) return reply.status(404).send({ error: 'Curso não encontrado.' })

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
      include: { progress: { select: { lessonId: true } } },
    })
    if (!enrollment) return reply.status(403).send({ error: 'Você não está matriculado neste curso.' })

    const doneLessons = new Set(enrollment.progress.map((p) => p.lessonId))
    const examIds = [
      ...course.modules.map((m) => m.exam?.id).filter((v): v is string => Boolean(v)),
      ...course.exams.map((e) => e.id),
    ]
    const attempts = await prisma.examAttempt.findMany({
      where: { examId: { in: examIds }, userId },
      select: { examId: true, passed: true, status: true },
    })

    let prevComplete = true
    const modules = course.modules.map((m) => {
      const lessonsTotal = m.lessons.length
      const lessonsDone = m.lessons.filter((l) => doneLessons.has(l.id)).length
      const state = examState(attempts, m.exam?.id, m.exam?.status)
      const lessonsOk = lessonsTotal === 0 || lessonsDone === lessonsTotal
      const examOk = state === 'none' || state === 'passed'
      const completed = lessonsOk && examOk
      const unlocked = prevComplete
      prevComplete = prevComplete && completed
      return {
        id: m.id,
        title: m.title,
        order: m.order,
        lessonsDone,
        lessonsTotal,
        exam: m.exam ? { id: m.exam.id, state } : null,
        unlocked,
        completed,
      }
    })

    const finalExam = course.exams[0]
    const allModulesDone = modules.every((m) => m.completed)
    const finalState = examState(attempts, finalExam?.id, finalExam?.status)
    const courseCompleted = allModulesDone && (finalState === 'none' || finalState === 'passed')

    return {
      modules,
      finalExam: finalExam ? { id: finalExam.id, state: finalState, unlocked: allModulesDone } : null,
      courseCompleted,
    }
  })
}
