import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../lib/session.js'

export default async function certificateRoutes(app: FastifyInstance) {
  app.get('/certificates', {
    preHandler: [requireAuth],
    schema: {
      tags: ['certificates'],
      summary: 'Lista certificados do usuário logado',
    },
  }, async (request) => {
    const certificates = await prisma.certificate.findMany({
      where: { enrollment: { userId: request.session.user.id } },
      include: {
        enrollment: {
          include: {
            course: { select: { id: true, slug: true, title: true, coverImage: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return certificates.map(({ id, code, issuedAt, url, enrollment }) => ({
      id,
      code,
      issuedAt,
      url,
      course: enrollment.course,
    }))
  })

  app.get('/certificates/:code', {
    schema: {
      tags: ['certificates'],
      summary: 'Verifica um certificado pelo código',
      params: {
        type: 'object',
        required: ['code'],
        properties: { code: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { code } = request.params as { code: string }

    const certificate = await prisma.certificate.findUnique({
      where: { code },
      include: {
        enrollment: {
          include: {
            user: { select: { id: true, name: true } },
            course: { select: { id: true, slug: true, title: true, coverImage: true } },
          },
        },
      },
    })

    if (!certificate) return reply.status(404).send({ error: 'Certificado não encontrado.' })

    const { id, issuedAt, url, enrollment } = certificate
    return {
      id,
      code: certificate.code,
      issuedAt,
      url,
      course: enrollment.course,
      user: enrollment.user,
    }
  })
}
