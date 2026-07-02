import type { FastifyInstance } from 'fastify'
import { ChildRecordType, ShareMode } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'

const ACHIEVEMENTS = [
  { key: 'primeiro-marco', label: 'Primeiro marco', threshold: 1 },
  { key: 'em-progresso', label: 'Em progresso', threshold: 3 },
  { key: 'super-estrela', label: 'Super estrela', threshold: 5 },
  { key: 'campeao', label: 'Campeão', threshold: 10 },
]

export default async function acompanhamentoRoutes(app: FastifyInstance) {
  app.get('/acompanhamento/:token', {
    schema: {
      tags: ['acompanhamento'],
      summary: 'Acompanhamento público por token (criança ou responsável)',
      params: {
        type: 'object',
        required: ['token'],
        properties: { token: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { token } = request.params as { token: string }

    const link = await prisma.childShareLink.findUnique({
      where: { token },
      include: { child: true },
    })

    if (!link) return reply.status(404).send({ error: 'Link não encontrado.' })
    if (link.revokedAt || link.expiresAt < new Date()) {
      return reply.status(410).send({ error: 'Link expirado ou revogado.' })
    }

    if (link.mode === ShareMode.CRIANCA) {
      const milestones = await prisma.childRecord.findMany({
        where: { childId: link.childId, type: ChildRecordType.EVOLUCAO },
        select: { id: true, date: true },
        orderBy: { date: 'asc' },
      })

      const total = milestones.length
      return {
        mode: ShareMode.CRIANCA,
        child: { id: link.child.id, name: link.child.name },
        progress: { totalMilestones: total },
        milestones,
        achievements: ACHIEVEMENTS.map((a) => ({ ...a, earned: total >= a.threshold })),
      }
    }

    const records = await prisma.childRecord.findMany({
      where: { childId: link.childId },
      select: { id: true, type: true, content: true, date: true },
      orderBy: { date: 'desc' },
    })

    return {
      mode: ShareMode.RESPONSAVEL,
      child: {
        id: link.child.id,
        name: link.child.name,
        birthDate: link.child.birthDate,
        diagnosis: link.child.diagnosis,
      },
      records,
    }
  })
}
