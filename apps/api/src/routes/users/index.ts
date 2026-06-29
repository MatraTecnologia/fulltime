import type { FastifyInstance } from 'fastify'
import { requireAuth } from '../../lib/session.js'

export default async function userRoutes(app: FastifyInstance) {
  app.get('/users/me', {
    preHandler: requireAuth,
    schema: { tags: ['users'], summary: 'Usuário logado' },
  }, async (request) => {
    const { id, name, email, role, image } = request.session.user
    return { id, name, email, role, image }
  })
}
