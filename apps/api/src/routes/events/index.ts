import type { FastifyInstance } from 'fastify'
import { Prisma, EventStatus } from '../../generated/prisma/client.js'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../../lib/auth.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole, type Role } from '../../lib/session.js'

const slugify = (value: string) =>
  value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

export default async function eventRoutes(app: FastifyInstance) {
  app.get('/events', {
    schema: {
      tags: ['events'],
      summary: 'Lista eventos',
      querystring: {
        type: 'object',
        properties: {
          when: { type: 'string', enum: ['upcoming', 'past'] },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
        },
      },
    },
  }, async (request) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
    const isPrivileged = session?.user.role === 'admin' || session?.user.role === 'instrutor'
    const { when = 'upcoming', status } = request.query as { when?: 'upcoming' | 'past'; status?: EventStatus }

    const now = new Date()
    const isPast = when === 'past'

    return prisma.event.findMany({
      where: {
        status: isPrivileged && status ? status : EventStatus.PUBLISHED,
        startsAt: isPast ? { lt: now } : { gte: now },
      },
      include: { _count: { select: { registrations: true } } },
      orderBy: { startsAt: isPast ? 'desc' : 'asc' },
    })
  })

  app.get('/events/:slug', {
    schema: {
      tags: ['events'],
      summary: 'Detalhes do evento',
      params: {
        type: 'object',
        required: ['slug'],
        properties: { slug: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string }
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })

    const event = await prisma.event.findUnique({
      where: { slug },
      include: { _count: { select: { registrations: true } } },
    })

    if (!event) return reply.status(404).send({ error: 'Evento não encontrado.' })

    if (event.status === EventStatus.DRAFT) {
      const role = session?.user.role as Role | undefined
      if (role !== 'admin' && role !== 'instrutor') {
        return reply.status(404).send({ error: 'Evento não encontrado.' })
      }
    }

    const registered = session
      ? Boolean(await prisma.eventRegistration.findUnique({
          where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
        }))
      : false

    return { ...event, registered }
  })

  app.post('/events/:id/register', {
    preHandler: [requireAuth],
    schema: {
      tags: ['events'],
      summary: 'Inscreve usuário no evento',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.session.user.id

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) return reply.status(404).send({ error: 'Evento não encontrado.' })

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: id, userId } },
    })
    if (existing) return reply.status(200).send(existing)

    try {
      const registration = await prisma.eventRegistration.create({
        data: { eventId: id, userId },
      })
      return reply.status(201).send(registration)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const fallback = await prisma.eventRegistration.findUnique({
          where: { eventId_userId: { eventId: id, userId } },
        })
        return reply.status(200).send(fallback)
      }
      throw error
    }
  })

  app.delete('/events/:id/register', {
    preHandler: [requireAuth],
    schema: {
      tags: ['events'],
      summary: 'Cancela inscrição do usuário no evento',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const userId = request.session.user.id

    try {
      await prisma.eventRegistration.delete({
        where: { eventId_userId: { eventId: id, userId } },
      })
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025')) {
        throw error
      }
    }
    return reply.status(204).send()
  })

  app.post('/events', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['events'],
      summary: 'Cria evento',
      body: {
        type: 'object',
        required: ['title', 'startsAt'],
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['WEBINAR', 'LIVE', 'WORKSHOP'] },
          startsAt: { type: 'string', format: 'date-time' },
          durationMin: { type: 'integer' },
          url: { type: 'string' },
          coverImage: { type: ['string', 'null'] },
        },
      },
    },
  }, async (request, reply) => {
    const { title, slug, description, type, startsAt, durationMin, url, coverImage } = request.body as {
      title: string
      slug?: string
      description?: string
      type?: 'WEBINAR' | 'LIVE' | 'WORKSHOP'
      startsAt: string
      durationMin?: number
      url?: string
      coverImage?: string | null
    }

    try {
      const event = await prisma.event.create({
        data: {
          title,
          slug: slug ?? slugify(title),
          description,
          type,
          startsAt: new Date(startsAt),
          durationMin,
          url,
          coverImage,
        },
      })
      return reply.status(201).send(event)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ error: 'Já existe um evento com este slug.' })
      }
      throw error
    }
  })

  app.patch('/events/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['events'],
      summary: 'Atualiza evento',
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
          type: { type: 'string', enum: ['WEBINAR', 'LIVE', 'WORKSHOP'] },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          startsAt: { type: 'string', format: 'date-time' },
          durationMin: { type: 'integer' },
          url: { type: 'string' },
          coverImage: { type: ['string', 'null'] },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, slug, description, type, status, startsAt, durationMin, url, coverImage } = request.body as {
      title?: string
      slug?: string
      description?: string
      type?: 'WEBINAR' | 'LIVE' | 'WORKSHOP'
      status?: EventStatus
      startsAt?: string
      durationMin?: number
      url?: string
      coverImage?: string | null
    }

    try {
      const event = await prisma.event.update({
        where: { id },
        data: {
          title,
          slug,
          description,
          type,
          status,
          ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
          durationMin,
          url,
          coverImage,
        },
      })
      return event
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return reply.status(404).send({ error: 'Evento não encontrado.' })
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Já existe um evento com este slug.' })
      }
      throw error
    }
  })

  app.delete('/events/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['events'],
      summary: 'Remove evento',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.event.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Evento não encontrado.' })
      }
      throw error
    }
  })
}
