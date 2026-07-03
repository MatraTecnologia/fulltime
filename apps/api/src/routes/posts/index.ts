import type { FastifyInstance } from 'fastify'
import { Prisma, PostStatus } from '../../generated/prisma/client.js'
import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../../lib/auth.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole, type Role } from '../../lib/session.js'

const slugify = (value: string) =>
  value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const listSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  author: { select: { id: true, name: true, image: true } },
  categories: { select: { id: true, name: true } },
} as const

export default async function postRoutes(app: FastifyInstance) {
  app.get('/posts', {
    schema: {
      tags: ['posts'],
      summary: 'Lista posts do blog',
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          category: { type: 'string' },
        },
      },
    },
  }, async (request) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
    const isPrivileged = session?.user.role === 'admin' || session?.user.role === 'instrutor'
    const { status, category } = request.query as { status?: PostStatus; category?: string }

    return prisma.post.findMany({
      where: {
        status: isPrivileged && status ? status : PostStatus.PUBLISHED,
        ...(category ? { categories: { some: { name: category } } } : {}),
      },
      select: listSelect,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    })
  })

  app.get('/posts/:slug', {
    schema: {
      tags: ['posts'],
      summary: 'Detalhes do post',
      params: {
        type: 'object',
        required: ['slug'],
        properties: { slug: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string }

    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, image: true } },
        categories: { select: { id: true, name: true } },
      },
    })

    if (!post) return reply.status(404).send({ error: 'Post não encontrado.' })

    if (post.status === PostStatus.DRAFT) {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) })
      const role = session?.user.role as Role | undefined
      if (role !== 'admin' && role !== 'instrutor') {
        return reply.status(404).send({ error: 'Post não encontrado.' })
      }
    }

    return post
  })

  app.post('/posts', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['posts'],
      summary: 'Cria post',
      body: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          excerpt: { type: ['string', 'null'] },
          coverImage: { type: ['string', 'null'] },
          slug: { type: 'string' },
          categoryIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const { title, content, excerpt, coverImage, slug, categoryIds } = request.body as {
      title: string
      content: string
      excerpt?: string | null
      coverImage?: string | null
      slug?: string
      categoryIds?: string[]
    }

    try {
      const post = await prisma.post.create({
        data: {
          title,
          content,
          excerpt,
          coverImage,
          slug: slug ? slugify(slug) : slugify(title),
          authorId: request.session.user.id,
          ...(categoryIds?.length ? { categories: { connect: categoryIds.map(id => ({ id })) } } : {}),
        },
        include: { author: { select: { id: true, name: true } }, categories: { select: { id: true, name: true } } },
      })
      return reply.status(201).send(post)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ error: 'Já existe um post com este slug.' })
      }
      throw error
    }
  })

  app.patch('/posts/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['posts'],
      summary: 'Atualiza post',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          excerpt: { type: ['string', 'null'] },
          coverImage: { type: ['string', 'null'] },
          slug: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'] },
          categoryIds: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, content, excerpt, coverImage, slug, status, categoryIds } = request.body as {
      title?: string
      content?: string
      excerpt?: string | null
      coverImage?: string | null
      slug?: string
      status?: PostStatus
      categoryIds?: string[]
    }

    try {
      const post = await prisma.post.update({
        where: { id },
        data: {
          title,
          content,
          excerpt,
          coverImage,
          slug: slug ? slugify(slug) : undefined,
          status,
          ...(status === PostStatus.PUBLISHED ? { publishedAt: new Date() } : {}),
          ...(categoryIds ? { categories: { set: categoryIds.map(cid => ({ id: cid })) } } : {}),
        },
        include: { author: { select: { id: true, name: true } }, categories: { select: { id: true, name: true } } },
      })
      return post
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') return reply.status(404).send({ error: 'Post não encontrado.' })
        if (error.code === 'P2002') return reply.status(409).send({ error: 'Já existe um post com este slug.' })
      }
      throw error
    }
  })

  app.delete('/posts/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['posts'],
      summary: 'Remove post',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    try {
      await prisma.post.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Post não encontrado.' })
      }
      throw error
    }
  })
}
