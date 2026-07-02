import type { FastifyInstance } from 'fastify'
import { Prisma, ChildRecordType, ShareMode } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../lib/session.js'
import { generateShareToken } from '../../lib/shareToken.js'

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
          birthDate: { type: 'string', format: 'date' },
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

    try {
      const child = await prisma.child.create({
        data: {
          ownerProfId: request.session.user.id,
          name,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          diagnosis,
        },
      })
      return reply.status(201).send(child)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return reply.status(404).send({ error: 'Profissional não encontrado.' })
      }
      throw error
    }
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
          birthDate: { type: 'string', format: 'date' },
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

    try {
      const updated = await prisma.child.update({
        where: { id },
        data: {
          name,
          birthDate: birthDate !== undefined ? new Date(birthDate) : undefined,
          diagnosis,
        },
      })
      return updated
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Criança não encontrada.' })
      }
      throw error
    }
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

    try {
      await prisma.child.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Criança não encontrada.' })
      }
      throw error
    }
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
          date: { type: 'string', format: 'date' },
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

    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return reply.status(404).send({ error: 'Criança não encontrada.' })
      }
      throw error
    }
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

    try {
      await prisma.childRecord.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Registro não encontrado.' })
      }
      throw error
    }
  })

  app.post('/children/:id/share-links', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Cria link de acompanhamento da criança',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['mode', 'expiresInDays'],
        properties: {
          mode: { type: 'string', enum: ['CRIANCA', 'RESPONSAVEL'] },
          expiresInDays: { type: 'integer', minimum: 1, maximum: 365 },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { mode, expiresInDays } = request.body as { mode: ShareMode; expiresInDays: number }

    const child = await findOwnedChild(id, request.session.user.id)
    if (!child) return reply.status(404).send({ error: 'Criança não encontrada.' })

    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    const link = await prisma.childShareLink.create({
      data: {
        childId: id,
        mode,
        expiresAt,
        token: generateShareToken(),
        createdById: request.session.user.id,
      },
    })
    return reply.status(201).send(link)
  })

  app.get('/children/:id/share-links', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Lista links de acompanhamento da criança',
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

    return prisma.childShareLink.findMany({
      where: { childId: id },
      orderBy: { createdAt: 'desc' },
    })
  })

  app.delete('/share-links/:id', {
    preHandler: [requireAuth],
    schema: {
      tags: ['children'],
      summary: 'Revoga link de acompanhamento',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const link = await prisma.childShareLink.findUnique({
      where: { id },
      include: { child: { select: { ownerProfId: true } } },
    })
    if (!link || link.child.ownerProfId !== request.session.user.id) {
      return reply.status(404).send({ error: 'Link não encontrado.' })
    }

    const revoked = await prisma.childShareLink.update({
      where: { id },
      data: { revokedAt: link.revokedAt ?? new Date() },
    })
    return revoked
  })
}
