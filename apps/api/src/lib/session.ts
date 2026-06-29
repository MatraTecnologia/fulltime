import type { FastifyRequest, FastifyReply } from 'fastify'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from './auth.js'

export type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
export type Role = 'admin' | 'instrutor' | 'profissional'

declare module 'fastify' {
  interface FastifyRequest {
    session: Session
  }
}

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
  if (!session) return reply.status(401).send({ error: 'Não autorizado.' })
  request.session = session
}

export const requireRole = (...roles: Role[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.session) return reply.status(401).send({ error: 'Não autorizado.' })
    const role = request.session.user.role as Role
    if (!roles.includes(role)) {
      return reply.status(403).send({ error: `Permissão insuficiente. Requer: ${roles.join(', ')}` })
    }
  }
}
