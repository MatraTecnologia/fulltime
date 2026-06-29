import type { FastifyInstance } from 'fastify'
import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'

export default async function moduleRoutes(app: FastifyInstance) {
  app.post('/courses/:courseId/modules', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['modules'],
      summary: 'Cria módulo no curso',
      params: {
        type: 'object',
        required: ['courseId'],
        properties: { courseId: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          order: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string }
    const { title, order: orderInput } = request.body as { title: string; order?: number }

    let order = orderInput
    if (order === undefined) {
      const agg = await prisma.module.aggregate({
        where: { courseId },
        _max: { order: true },
      })
      order = (agg._max.order ?? 0) + 1
    }

    try {
      const module = await prisma.module.create({
        data: { courseId, title, order },
      })
      return reply.status(201).send(module)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') return reply.status(404).send({ error: 'Curso não encontrado.' })
      }
      throw error
    }
  })

  app.patch('/modules/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['modules'],
      summary: 'Atualiza módulo',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          order: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, order } = request.body as { title?: string; order?: number }

    try {
      const module = await prisma.module.update({
        where: { id },
        data: { title, order },
      })
      return module
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Módulo não encontrado.' })
      }
      throw error
    }
  })

  app.delete('/modules/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['modules'],
      summary: 'Remove módulo',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.module.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Módulo não encontrado.' })
      }
      throw error
    }
  })
}
