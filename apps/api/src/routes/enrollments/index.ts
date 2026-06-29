import type { FastifyInstance } from 'fastify'
import { Prisma, CourseStatus, EnrollmentStatus } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../lib/session.js'
import { generateCertificateCode } from '../../lib/certificate.js'

export default async function enrollmentRoutes(app: FastifyInstance) {
  app.post('/courses/:courseId/enroll', {
    preHandler: [requireAuth],
    schema: {
      tags: ['enrollments'],
      summary: 'Matricula usuário no curso',
      params: {
        type: 'object',
        required: ['courseId'],
        properties: { courseId: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string }
    const userId = request.session.user.id

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return reply.status(404).send({ error: 'Curso não encontrado.' })
    if (course.status !== CourseStatus.PUBLISHED) {
      return reply.status(403).send({ error: 'Curso não disponível para matrícula.' })
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    if (existing) return reply.status(200).send(existing)

    try {
      const enrollment = await prisma.enrollment.create({
        data: { userId, courseId },
      })
      return reply.status(201).send(enrollment)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const fallback = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId } },
        })
        return reply.status(200).send(fallback)
      }
      throw error
    }
  })

  app.get('/enrollments', {
    preHandler: [requireAuth],
    schema: {
      tags: ['enrollments'],
      summary: 'Lista matrículas do usuário logado',
    },
  }, async (request) => {
    const userId = request.session.user.id

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, slug: true, title: true, coverImage: true } },
        _count: { select: { progress: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return Promise.all(
      enrollments.map(async ({ _count, ...e }) => {
        const totalLessons = await prisma.lesson.count({
          where: { module: { courseId: e.courseId } },
        })
        return { ...e, progressCount: _count.progress, totalLessons }
      })
    )
  })

  app.get('/enrollments/:id', {
    preHandler: [requireAuth],
    schema: {
      tags: ['enrollments'],
      summary: 'Detalhe da matrícula',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, slug: true, title: true, coverImage: true } },
        progress: { include: { lesson: { select: { id: true, title: true, order: true } } } },
        certificate: true,
      },
    })

    if (!enrollment) return reply.status(404).send({ error: 'Matrícula não encontrada.' })
    if (enrollment.userId !== request.session.user.id) {
      return reply.status(403).send({ error: 'Acesso negado.' })
    }

    return enrollment
  })

  app.post('/enrollments/:id/lessons/:lessonId/complete', {
    preHandler: [requireAuth],
    schema: {
      tags: ['enrollments'],
      summary: 'Marca aula como concluída',
      params: {
        type: 'object',
        required: ['id', 'lessonId'],
        properties: {
          id: { type: 'string' },
          lessonId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id, lessonId } = request.params as { id: string; lessonId: string }

    const enrollment = await prisma.enrollment.findUnique({ where: { id } })
    if (!enrollment) return reply.status(404).send({ error: 'Matrícula não encontrada.' })
    if (enrollment.userId !== request.session.user.id) {
      return reply.status(403).send({ error: 'Acesso negado.' })
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { select: { courseId: true } } },
    })
    if (!lesson || lesson.module.courseId !== enrollment.courseId) {
      return reply.status(404).send({ error: 'Aula não encontrada neste curso.' })
    }

    await prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: id, lessonId } },
      create: { enrollmentId: id, lessonId },
      update: {},
    })

    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { module: { courseId: enrollment.courseId } } }),
      prisma.lessonProgress.count({ where: { enrollmentId: id } }),
    ])

    return {
      completed: totalLessons > 0 && completedLessons === totalLessons,
      totalLessons,
      completedLessons,
    }
  })

  app.post('/enrollments/:id/certificate', {
    preHandler: [requireAuth],
    schema: {
      tags: ['enrollments'],
      summary: 'Emite certificado de conclusão',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { certificate: true },
    })
    if (!enrollment) return reply.status(404).send({ error: 'Matrícula não encontrada.' })
    if (enrollment.userId !== request.session.user.id) {
      return reply.status(403).send({ error: 'Acesso negado.' })
    }

    if (enrollment.certificate) return reply.status(200).send(enrollment.certificate)

    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { module: { courseId: enrollment.courseId } } }),
      prisma.lessonProgress.count({ where: { enrollmentId: id } }),
    ])

    if (!(totalLessons > 0 && completedLessons === totalLessons)) {
      return reply.status(422).send({
        error: 'Todas as aulas devem ser concluídas antes de emitir o certificado.',
        completedLessons,
        totalLessons,
      })
    }

    try {
      const [certificate] = await prisma.$transaction([
        prisma.certificate.create({
          data: { enrollmentId: id, code: generateCertificateCode() },
        }),
        prisma.enrollment.update({
          where: { id },
          data: { status: EnrollmentStatus.COMPLETED },
        }),
      ])
      return reply.status(201).send(certificate)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await prisma.certificate.findUnique({ where: { enrollmentId: id } })
        return reply.status(200).send(existing)
      }
      throw error
    }
  })

  app.get('/enrollments/:id/certificate', {
    preHandler: [requireAuth],
    schema: {
      tags: ['enrollments'],
      summary: 'Retorna certificado da matrícula',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { certificate: true },
    })
    if (!enrollment) return reply.status(404).send({ error: 'Matrícula não encontrada.' })
    if (enrollment.userId !== request.session.user.id) {
      return reply.status(403).send({ error: 'Acesso negado.' })
    }
    if (!enrollment.certificate) return reply.status(404).send({ error: 'Certificado não encontrado.' })

    return enrollment.certificate
  })
}
