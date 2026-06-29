import type { FastifyInstance } from 'fastify'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../../lib/auth.js'

export default async function authRoutes(app: FastifyInstance) {
  app.route({
    method: ['GET', 'POST'],
    url: '/auth/*',
    schema: { tags: ['auth'], hide: true },
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`)
        const headers = fromNodeHeaders(request.headers)
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        })
        const res = await auth.handler(req)
        reply.status(res.status)
        res.headers.forEach((value, key) => reply.header(key, value))
        return reply.send(res.body ? await res.text() : null)
      } catch (error) {
        app.log.error({ error }, 'Erro na autenticação')
        return reply.status(500).send({ error: 'Erro interno de autenticação.' })
      }
    },
  })
}
