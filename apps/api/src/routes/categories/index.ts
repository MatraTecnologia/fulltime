import type { FastifyInstance } from 'fastify'
import { Prisma, CourseStatus } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'

export default async function categoryRoutes(app: FastifyInstance) {
  app.get('/categories', {
    schema: {
      tags: ['categories'],
      summary: 'Lista categorias',
    },
  }, async () => {
    return prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: 'asc' },
    })
  })

  app.get('/categories/:slug', {
    schema: {
      tags: ['categories'],
      summary: 'Detalhes da categoria',
      params: {
        type: 'object',
        required: ['slug'],
        properties: { slug: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string }

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        courses: {
          where: { status: CourseStatus.PUBLISHED },
          include: {
            instructor: { select: { id: true, name: true } },
            _count: { select: { modules: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!category) return reply.status(404).send({ error: 'Categoria não encontrada.' })

    return category
  })

  app.post('/categories', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['categories'],
      summary: 'Cria categoria',
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          color: { type: ['string', 'null'] },
          icon: { type: ['string', 'null'] },
        },
      },
    },
  }, async (request, reply) => {
    const { name, slug, description, color, icon } = request.body as {
      name: string
      slug?: string
      description?: string
      color?: string | null
      icon?: string | null
    }

    const resolvedSlug = slug ?? name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    try {
      const category = await prisma.category.create({
        data: { name, slug: resolvedSlug, description, color, icon },
      })
      return reply.status(201).send(category)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ error: 'Já existe uma categoria com este slug.' })
      }
      throw error
    }
  })

  app.patch('/categories/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['categories'],
      summary: 'Atualiza categoria',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          color: { type: ['string', 'null'] },
          icon: { type: ['string', 'null'] },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { name, slug, description, color, icon } = request.body as {
      name?: string
      slug?: string
      description?: string
      color?: string | null
      icon?: string | null
    }

    try {
      const category = await prisma.category.update({
        where: { id },
        data: { name, slug, description, color, icon },
      })
      return category
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return reply.status(404).send({ error: 'Categoria não encontrada.' })
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Já existe uma categoria com este slug.' })
      }
      throw error
    }
  })

  app.delete('/categories/:id', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['categories'],
      summary: 'Remove categoria',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.category.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Categoria não encontrada.' })
      }
      throw error
    }
  })
}
