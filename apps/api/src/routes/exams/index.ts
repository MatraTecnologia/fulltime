import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'
import { validateQuestions, type ExamQuestionInput } from '../../lib/exam.js'

type SessionUser = { id: string; role?: string | null }

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
}
