import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole, type Role } from '../../lib/session.js'

type OptionInput = { text: string; isCorrect: boolean; order?: number }
type QuestionInput = { statement: string; order?: number; options: OptionInput[] }

export const registerQuizRoutes = (app: FastifyInstance) => {
  app.get('/lessons/:id/quiz', {
    preHandler: [requireAuth],
    schema: {
      tags: ['quiz'],
      summary: 'Quiz da aula (aluno não recebe o gabarito)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id: lessonId } = request.params as { id: string }
    const role = request.session.user.role as Role
    const isPrivileged = role === 'admin' || role === 'instrutor'

    const activity = await prisma.activity.findUnique({
      where: { lessonId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
      },
    })

    if (!activity) return reply.status(404).send({ error: 'Esta aula não tem atividade.' })

    const lastAttempt = await prisma.quizAttempt.findFirst({
      where: { activityId: activity.id, userId: request.session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { score: true, total: true, createdAt: true },
    })

    return {
      id: activity.id,
      lessonId,
      title: activity.title,
      questions: activity.questions.map((q) => ({
        id: q.id,
        statement: q.statement,
        order: q.order,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          order: o.order,
          ...(isPrivileged ? { isCorrect: o.isCorrect } : {}),
        })),
      })),
      lastAttempt,
    }
  })

  app.put('/lessons/:id/quiz', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['quiz'],
      summary: 'Cria ou substitui o quiz da aula',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: {
        type: 'object',
        required: ['title', 'questions'],
        properties: {
          title: { type: 'string' },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              required: ['statement', 'options'],
              properties: {
                statement: { type: 'string' },
                order: { type: 'integer', minimum: 0 },
                options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['text', 'isCorrect'],
                    properties: {
                      text: { type: 'string' },
                      isCorrect: { type: 'boolean' },
                      order: { type: 'integer', minimum: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { id: lessonId } = request.params as { id: string }
    const { title, questions } = request.body as { title: string; questions: QuestionInput[] }

    if (!questions.length) return reply.status(400).send({ error: 'O quiz precisa de ao menos uma pergunta.' })
    for (const q of questions) {
      if (q.options.length < 2) return reply.status(400).send({ error: 'Cada pergunta precisa de ao menos 2 alternativas.' })
      if (q.options.filter((o) => o.isCorrect).length !== 1) {
        return reply.status(400).send({ error: 'Cada pergunta precisa de exatamente 1 alternativa correta.' })
      }
    }

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } })
    if (!lesson) return reply.status(404).send({ error: 'Aula não encontrada.' })

    await prisma.$transaction(async (tx) => {
      const activity = await tx.activity.upsert({
        where: { lessonId },
        create: { lessonId, title },
        update: { title },
      })
      await tx.question.deleteMany({ where: { activityId: activity.id } })
      for (const [qi, q] of questions.entries()) {
        await tx.question.create({
          data: {
            activityId: activity.id,
            statement: q.statement,
            order: q.order ?? qi,
            options: {
              create: q.options.map((o, oi) => ({ text: o.text, isCorrect: o.isCorrect, order: o.order ?? oi })),
            },
          },
        })
      }
    })

    return reply.status(200).send({ ok: true })
  })

  app.delete('/lessons/:id/quiz', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['quiz'],
      summary: 'Remove o quiz da aula',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id: lessonId } = request.params as { id: string }
    try {
      await prisma.activity.delete({ where: { lessonId } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Esta aula não tem atividade.' })
      }
      throw error
    }
  })

  app.post('/lessons/:id/quiz/submit', {
    preHandler: [requireAuth],
    schema: {
      tags: ['quiz'],
      summary: 'Envia respostas e recebe a correção',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: {
        type: 'object',
        required: ['answers'],
        properties: {
          answers: { type: 'object', additionalProperties: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const { id: lessonId } = request.params as { id: string }
    const { answers } = request.body as { answers: Record<string, string> }

    const activity = await prisma.activity.findUnique({
      where: { lessonId },
      include: { questions: { include: { options: true } } },
    })
    if (!activity) return reply.status(404).send({ error: 'Esta aula não tem atividade.' })

    const corrections = activity.questions.map((q) => {
      const correct = q.options.find((o) => o.isCorrect)
      const chosenOptionId = answers[q.id] ?? null
      return {
        questionId: q.id,
        correctOptionId: correct?.id ?? null,
        chosenOptionId,
        correct: chosenOptionId != null && chosenOptionId === correct?.id,
      }
    })
    const score = corrections.filter((c) => c.correct).length
    const total = activity.questions.length

    await prisma.quizAttempt.create({
      data: { activityId: activity.id, userId: request.session.user.id, score, total, answers },
    })

    return { score, total, corrections }
  })

  app.get('/lessons/:id/quiz/attempts', {
    preHandler: [requireAuth],
    schema: {
      tags: ['quiz'],
      summary: 'Histórico de tentativas do usuário na atividade',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id: lessonId } = request.params as { id: string }
    const activity = await prisma.activity.findUnique({ where: { lessonId }, select: { id: true } })
    if (!activity) return reply.status(404).send({ error: 'Esta aula não tem atividade.' })

    return prisma.quizAttempt.findMany({
      where: { activityId: activity.id, userId: request.session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, score: true, total: true, createdAt: true },
    })
  })
}
