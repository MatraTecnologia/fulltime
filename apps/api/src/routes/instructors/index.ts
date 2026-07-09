import type { FastifyInstance } from 'fastify'
import { CourseStatus } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'

export default async function instructorsPublicRoutes(app: FastifyInstance) {
  app.get('/instructors', {
    schema: {
      tags: ['instructors'],
      summary: 'Lista instrutores em destaque',
    },
  }, async () => {
    const instructors = await prisma.user.findMany({
      where: { role: 'instrutor', courses: { some: { status: CourseStatus.PUBLISHED } } },
      select: {
        id: true,
        name: true,
        image: true,
        profile: { select: { area: true } },
        _count: { select: { courses: true } },
      },
      orderBy: { courses: { _count: 'desc' } },
      take: 8,
    })

    return instructors.map((i) => ({
      id: i.id,
      name: i.name,
      image: i.image,
      area: i.profile?.area ?? null,
      coursesCount: i._count.courses,
    }))
  })
}
