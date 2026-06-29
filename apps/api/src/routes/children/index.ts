import type { FastifyInstance } from 'fastify'
import { Prisma, ChildRecordType } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../lib/session.js'

const findOwnedChild = async (id: string, userId: string) => {
  const child = await prisma.child.findUnique({ where: { id } })
  if (!child || child.ownerProfId !== userId) return null
  return child
}

export default async function childrenRoutes(app: FastifyInstance) {
  app.get('/children', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Lista crianças do profissional logado',
    },
  }, async (request) => {
    return prisma.child.findMany({
      where: { ownerProfId: request.session.user.id },
      orderBy: { createdAt: 'desc' },
    })
  })

  app.post('/children', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Cria criança',
      body: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' },
          birthDate: { type: 'string', format: 'date-time' },
          diagnosis: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { name, birthDate, diagnosis } = request.body as {
      name: string
      birthDate?: string
      diagnosis?: string
    }

    const child = await prisma.child.create({
      data: {
        ownerProfId: request.session.user.id,
        name,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        diagnosis,
      },
    })
    return reply.status(201).send(child)
  })

  app.get('/children/:id', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Detalhes da criança',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const child = await prisma.child.findUnique({
      where: { id },
      include: { records: { orderBy: { date: 'desc' } } },
    })

    if (!child || child.ownerProfId !== request.session.user.id) {
      return reply.status(404).send({ error: 'Criança não encontrada.' })
    }

    return child
  })

  app.patch('/children/:id', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Atualiza criança',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          birthDate: { type: 'string', format: 'date-time' },
          diagnosis: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { name, birthDate, diagnosis } = request.body as {
      name?: string
      birthDate?: string
      diagnosis?: string
    }

    const child = await findOwnedChild(id, request.session.user.id)
    if (!child) return reply.status(404).send({ error: 'Criança não encontrada.' })

    const updated = await prisma.child.update({
      where: { id },
      data: {
        name,
        birthDate: birthDate !== undefined ? new Date(birthDate) : undefined,
        diagnosis,
      },
    })
    return updated
  })

  app.delete('/children/:id', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Remove criança',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const child = await findOwnedChild(id, request.session.user.id)
    if (!child) return reply.status(404).send({ error: 'Criança não encontrada.' })

    await prisma.child.delete({ where: { id } })
    return reply.status(204).send()
  })

  app.post('/children/:childId/records', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Cria registro da criança',
      params: {
        type: 'object',
        required: ['childId'],
        properties: { childId: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['type', 'content'],
        properties: {
          type: { type: 'string', enum: ['EVOLUCAO', 'SESSAO', 'PEI'] },
          content: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, async (request, reply) => {
    const { childId } = request.params as { childId: string }
    const { type, content, date } = request.body as {
      type: ChildRecordType
      content: string
      date?: string
    }

    const child = await findOwnedChild(childId, request.session.user.id)
    if (!child) return reply.status(404).send({ error: 'Criança não encontrada.' })

    const record = await prisma.childRecord.create({
      data: {
        childId,
        authorId: request.session.user.id,
        type,
        content,
        date: date ? new Date(date) : undefined,
      },
    })
    return reply.status(201).send(record)
  })

  app.get('/children/:childId/records', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Lista registros da criança',
      params: {
        type: 'object',
        required: ['childId'],
        properties: { childId: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { childId } = request.params as { childId: string }

    const child = await findOwnedChild(childId, request.session.user.id)
    if (!child) return reply.status(404).send({ error: 'Criança não encontrada.' })

    return prisma.childRecord.findMany({
      where: { childId },
      orderBy: { date: 'desc' },
    })
  })

  app.delete('/records/:id', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Remove registro',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const record = await prisma.childRecord.findUnique({ where: { id } })
    if (!record || record.authorId !== request.session.user.id) {
      return reply.status(404).send({ error: 'Registro não encontrado.' })
    }

    await prisma.childRecord.delete({ where: { id } })
    return reply.status(204).send()
  })
}
