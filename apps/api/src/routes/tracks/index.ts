import type { FastifyInstance } from 'fastify'
import { Prisma, CourseStatus } from '../../generated/prisma/client.js'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../../lib/auth.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole, type Role } from '../../lib/session.js'

type TrackLevel = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO'

export default async function trackRoutes(app: FastifyInstance) {
  app.get('/tracks', {
    schema: {
      tags: ['tracks'],
      summary: 'Lista trilhas',
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

    return prisma.track.findMany({
      where: {
        status: isPrivileged && status ? status : CourseStatus.PUBLISHED,
      },
      include: {
        _count: { select: { courses: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  app.get('/tracks/:slug', {
    schema: {
      tags: ['tracks'],
      summary: 'Detalhes da trilha',
      params: {
        type: 'object',
        required: ['slug'],
        properties: { slug: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string }

    const track = await prisma.track.findUnique({
      where: { slug },
      include: {
        courses: {
          orderBy: { order: 'asc' },
          include: {
            course: {
              include: {
                instructor: { select: { id: true, name: true } },
                _count: { select: { modules: true } },
              },
            },
          },
        },
      },
    })

    if (!track) return reply.status(404).send({ error: 'Trilha não encontrada.' })

    if (track.status === CourseStatus.DRAFT) {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
      const role = session?.user.role as Role | undefined
      if (role !== 'admin' && role !== 'instrutor') {
        return reply.status(404).send({ error: 'Trilha não encontrada.' })
      }
    }

    return track
  })

  app.post('/tracks', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['tracks'],
      summary: 'Cria trilha',
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          coverImage: { type: ['string', 'null'] },
          color: { type: ['string', 'null'] },
          icon: { type: ['string', 'null'] },
          level: { type: 'string', enum: ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'] },
        },
      },
    },
  }, async (request, reply) => {
    const { title, slug, description, coverImage, color, icon, level } = request.body as {
      title: string
      slug?: string
      description?: string
      coverImage?: string | null
      color?: string | null
      icon?: string | null
      level?: TrackLevel
    }

    const resolvedSlug = slug ?? title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    try {
      const track = await prisma.track.create({
        data: { title, slug: resolvedSlug, description, coverImage, color, icon, level },
      })
      return reply.status(201).send(track)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ error: 'Já existe uma trilha com este slug.' })
      }
      throw error
    }
  })

  app.patch('/tracks/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['tracks'],
      summary: 'Atualiza trilha',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          coverImage: { type: ['string', 'null'] },
          color: { type: ['string', 'null'] },
          icon: { type: ['string', 'null'] },
          level: { type: 'string', enum: ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO'] },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, slug, description, coverImage, color, icon, level, status } = request.body as {
      title?: string
      slug?: string
      description?: string
      coverImage?: string | null
      color?: string | null
      icon?: string | null
      level?: TrackLevel
      status?: CourseStatus
    }

    try {
      const track = await prisma.track.update({
        where: { id },
        data: { title, slug, description, coverImage, color, icon, level, status },
      })
      return track
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return reply.status(404).send({ error: 'Trilha não encontrada.' })
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Já existe uma trilha com este slug.' })
      }
      throw error
    }
  })

  app.delete('/tracks/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['tracks'],
      summary: 'Remove trilha',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.track.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Trilha não encontrada.' })
      }
      throw error
    }
  })

  app.post('/tracks/:id/courses', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['tracks'],
      summary: 'Adiciona curso à trilha',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['courseId'],
        properties: {
          courseId: { type: 'string' },
          order: { type: 'integer' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { courseId, order } = request.body as { courseId: string; order?: number }

    let resolvedOrder = order
    if (resolvedOrder === undefined) {
      const last = await prisma.trackCourse.findFirst({ where: { trackId: id }, orderBy: { order: 'desc' } })
      resolvedOrder = last ? last.order + 1 : 0
    }

    try {
      const trackCourse = await prisma.trackCourse.create({
        data: { trackId: id, courseId, order: resolvedOrder },
        include: {
          course: {
            include: {
              instructor: { select: { id: true, name: true } },
              _count: { select: { modules: true } },
            },
          },
        },
      })
      return reply.status(201).send(trackCourse)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Curso já está na trilha.' })
        if (error.code === 'P2003') return reply.status(404).send({ error: 'Trilha ou curso não encontrado.' })
      }
      throw error
    }
  })

  app.delete('/tracks/:id/courses/:courseId', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['tracks'],
      summary: 'Remove curso da trilha',
      params: {
        type: 'object',
        required: ['id', 'courseId'],
        properties: {
          id: { type: 'string' },
          courseId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id, courseId } = request.params as { id: string; courseId: string }

    try {
      await prisma.trackCourse.delete({
        where: { trackId_courseId: { trackId: id, courseId } },
      })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Associação não encontrada.' })
      }
      throw error
    }
  })
}
