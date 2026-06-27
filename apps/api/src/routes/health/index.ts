import type { FastifyInstance } from 'fastify'

export default async function healthRoutes(app: FastifyInstance) {
  app.get('/health', { schema: { tags: ['health'], summary: 'Healthcheck' } }, async (_req, reply) => {
    reply.send({ status: 'ok' })
  })
}
