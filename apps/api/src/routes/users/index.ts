import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole, type Role } from '../../lib/session.js'

export default async function userRoutes(app: FastifyInstance) {
  app.get('/users/me', {
    preHandler: requireAuth,
    schema: { tags: ['users'], summary: 'Usuário logado' },
  }, async (request) => {
    const { id, name, email, role, image } = request.session.user
    return { id, name, email, role, image }
  })

  app.get('/users', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['users'],
      summary: 'Lista usuários (busca, filtro por papel, paginação)',
      querystring: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          role: { type: 'string', enum: ['admin', 'instrutor', 'profissional'] },
          page: { type: 'integer', minimum: 1, default: 1 },
          pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
        },
      },
    },
  }, async (request) => {
    const { q, role, page = 1, pageSize = 20 } = request.query as {
      q?: string
      role?: Role
      page?: number
      pageSize?: number
    }

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return { items, total, page, pageSize }
  })

  app.get('/users/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['users'],
      summary: 'Detalhe do usuário',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        image: true,
        createdAt: true,
        courses: {
          select: { id: true, slug: true, title: true, status: true },
          orderBy: { createdAt: 'desc' },
        },
        children: {
          select: { id: true, name: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { courses: true, children: true, enrollments: true } },
      },
    })

    if (!user) return reply.status(404).send({ error: 'Usuário não encontrado.' })

    const { _count, ...rest } = user
    return {
      ...rest,
      counts: {
        courses: _count.courses,
        children: _count.children,
        enrollments: _count.enrollments,
      },
    }
  })

  app.patch('/users/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['users'],
      summary: 'Atualiza papel e status do usuário',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['admin', 'instrutor', 'profissional'] },
          active: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { role, active } = request.body as { role?: Role; active?: boolean }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role, active },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          image: true,
        },
      })
      return user
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Usuário não encontrado.' })
      }
      throw error
    }
  })
}
