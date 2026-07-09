import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { requireAuth } from '../../lib/session.js'

const shape = (
  user: { name: string; email: string; image?: string | null },
  profile: {
    area: string | null
    registro: string | null
    bio: string | null
    instagram: string | null
    linkedin: string | null
    website: string | null
  } | null
) => ({
  name: user.name,
  email: user.email,
  image: user.image ?? null,
  area: profile?.area ?? null,
  registro: profile?.registro ?? null,
  bio: profile?.bio ?? null,
  instagram: profile?.instagram ?? null,
  linkedin: profile?.linkedin ?? null,
  website: profile?.website ?? null,
})

export default async function meRoutes(app: FastifyInstance) {
  app.get('/me/profile', {
    preHandler: [requireAuth],
    schema: { tags: ['me'], summary: 'Perfil do instrutor logado' },
  }, async (request) => {
    const profile = await prisma.profileProf.findUnique({ where: { userId: request.session.user.id } })
    return shape(request.session.user, profile)
  })

  app.put('/me/profile', {
    preHandler: [requireAuth],
    schema: {
      tags: ['me'],
      summary: 'Atualiza o perfil do instrutor logado',
      body: {
        type: 'object',
        properties: {
          area: { type: ['string', 'null'] },
          registro: { type: ['string', 'null'] },
          bio: { type: ['string', 'null'] },
          instagram: { type: ['string', 'null'] },
          linkedin: { type: ['string', 'null'] },
          website: { type: ['string', 'null'] },
        },
      },
    },
  }, async (request) => {
    const userId = request.session.user.id
    const data = request.body as {
      area?: string | null
      registro?: string | null
      bio?: string | null
      instagram?: string | null
      linkedin?: string | null
      website?: string | null
    }

    const profile = await prisma.profileProf.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })

    return shape(request.session.user, profile)
  })
}
