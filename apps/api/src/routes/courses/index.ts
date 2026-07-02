import type { FastifyInstance } from 'fastify'
import { Prisma, CourseStatus } from '../../generated/prisma/client.js'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../../lib/auth.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole, type Role } from '../../lib/session.js'

export default async function courseRoutes(app: FastifyInstance) {
  app.get('/courses', {
    schema: {
      tags: ['courses'],
      summary: 'Lista cursos',
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
        },
      },
    },
  }, async (request) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
    const isPrivileged = session?.user.role === 'admin' || session?.user.role === 'instrutor'
    const { status } = request.query as { status?: CourseStatus }

    return prisma.course.findMany({
      where: { status: isPrivileged && status ? status : CourseStatus.PUBLISHED },
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { modules: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  app.get('/courses/:slug', {
    schema: {
      tags: ['courses'],
      summary: 'Detalhes do curso',
      params: {
        type: 'object',
        required: ['slug'],
        properties: { slug: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string }

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              select: { id: true, title: true, order: true, durationSec: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })

    if (!course) return reply.status(404).send({ error: 'Curso não encontrado.' })

    if (course.status === CourseStatus.DRAFT) {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
      const role = session?.user.role as Role | undefined
      if (role !== 'admin' && role !== 'instrutor') {
        return reply.status(404).send({ error: 'Curso não encontrado.' })
      }
    }

    return course
  })

  app.post('/courses', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['courses'],
      summary: 'Cria curso',
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          coverImage: { type: 'string' },
          slug: { type: 'string' },
          instructorId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { title, description, coverImage, slug, instructorId } = request.body as {
      title: string
      description?: string
      coverImage?: string
      slug?: string
      instructorId?: string
    }

    const resolvedSlug = slug ?? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    try {
      const course = await prisma.course.create({
        data: {
          title,
          description,
          coverImage,
          slug: resolvedSlug,
          instructorId: instructorId ?? request.session.user.id,
        },
        include: { instructor: { select: { id: true, name: true } } },
      })
      return reply.status(201).send(course)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ error: 'Já existe um curso com este slug.' })
      }
      throw error
    }
  })

  app.patch('/courses/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['courses'],
      summary: 'Atualiza curso',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          coverImage: { type: 'string' },
          slug: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          instructorId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, description, coverImage, slug, status, instructorId } = request.body as {
      title?: string
      description?: string
      coverImage?: string
      slug?: string
      status?: CourseStatus
      instructorId?: string
    }

    try {
      const course = await prisma.course.update({
        where: { id },
        data: { title, description, coverImage, slug, status, instructorId },
        include: { instructor: { select: { id: true, name: true } } },
      })
      return course
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return reply.status(404).send({ error: 'Curso não encontrado.' })
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Já existe um curso com este slug.' })
      }
      throw error
    }
  })

  app.post('/courses/:id/publish', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['courses'],
      summary: 'Publica curso',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const course = await prisma.course.update({
        where: { id },
        data: { status: CourseStatus.PUBLISHED },
      })
      return course
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Curso não encontrado.' })
      }
      throw error
    }
  })

  app.delete('/courses/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['courses'],
      summary: 'Remove curso',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.course.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Curso não encontrado.' })
      }
      throw error
    }
  })
}
