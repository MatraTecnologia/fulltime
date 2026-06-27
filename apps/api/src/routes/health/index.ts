import type { FastifyInstance } from 'fastify'

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/', { schema: { tags: ['health'], summary: 'Healthcheck' } }, async (_req, reply) => {
    reply.send({ status: 'ok' })
  })
}
