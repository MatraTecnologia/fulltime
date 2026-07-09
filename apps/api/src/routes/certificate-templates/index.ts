import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'
import { renderToHtml, type CertElement, type CertTemplate } from '../../lib/certificate-renderer.js'
import { DEFAULT_TEMPLATE } from '../../lib/certificate-default-template.js'

type TemplateBody = {
  name?: string
  pageSize?: string
  background?: string | null
  backgroundColor?: string | null
  elements?: CertElement[]
  isDefault?: boolean
}

const templateBodyProps = {
  name: { type: 'string' },
  pageSize: { type: 'string', enum: ['A4_LANDSCAPE', 'A4_PORTRAIT'] },
  background: { type: ['string', 'null'] },
  backgroundColor: { type: ['string', 'null'] },
  elements: { type: 'array' },
} as const

const sampleData = {
  studentName: 'Maria da Silva Santos',
  courseTitle: 'Nome do Curso de Exemplo',
  issueDate: '8 de julho de 2026',
  code: 'FT-EXEMPLO1',
  instructorName: 'Prof. Exemplo',
  courseDurationHours: '10',
  verifyUrl: 'https://exemplo/certificados/FT-EXEMPLO1',
}

export default async function certificateTemplateRoutes(app: FastifyInstance) {
  app.get('/certificate-templates', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificate-templates'],
      summary: 'Lista modelos de certificado',
    },
  }, async () => {
    const templates = await prisma.certificateTemplate.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return templates.map(({ _count, ...t }) => ({
      id: t.id,
      name: t.name,
      pageSize: t.pageSize,
      background: t.background,
      backgroundColor: t.backgroundColor,
      elements: t.elements,
      isDefault: t.isDefault,
      createdAt: t.createdAt,
      coursesCount: _count.courses,
    }))
  })

  app.get('/certificate-templates/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificate-templates'],
      summary: 'Detalhe de um modelo de certificado',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const template = await prisma.certificateTemplate.findUnique({ where: { id } })
    if (!template) return reply.status(404).send({ error: 'Modelo não encontrado.' })

    return template
  })

  app.post('/certificate-templates', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificate-templates'],
      summary: 'Cria modelo de certificado',
      body: {
        type: 'object',
        required: ['name'],
        properties: templateBodyProps,
      },
    },
  }, async (request, reply) => {
    const { name, pageSize, background, backgroundColor, elements } = request.body as TemplateBody

    const template = await prisma.certificateTemplate.create({
      data: {
        name: name!,
        pageSize: pageSize ?? 'A4_LANDSCAPE',
        background,
        backgroundColor,
        elements: (elements ?? DEFAULT_TEMPLATE.elements) as unknown as Prisma.InputJsonValue,
        createdById: request.session.user.id,
      },
    })

    return reply.status(201).send(template)
  })

  app.patch('/certificate-templates/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificate-templates'],
      summary: 'Atualiza modelo de certificado',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: { ...templateBodyProps, isDefault: { type: 'boolean' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { name, pageSize, background, backgroundColor, elements, isDefault } = request.body as TemplateBody

    const data: Prisma.CertificateTemplateUpdateInput = {
      name,
      pageSize,
      background,
      backgroundColor,
      isDefault,
      ...(elements !== undefined ? { elements: elements as unknown as Prisma.InputJsonValue } : {}),
    }

    try {
      if (isDefault === true) {
        const [, template] = await prisma.$transaction([
          prisma.certificateTemplate.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
          }),
          prisma.certificateTemplate.update({ where: { id }, data }),
        ])
        return template
      }

      return await prisma.certificateTemplate.update({ where: { id }, data })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Modelo não encontrado.' })
      }
      throw error
    }
  })

  app.delete('/certificate-templates/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificate-templates'],
      summary: 'Remove modelo de certificado',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.certificateTemplate.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Modelo não encontrado.' })
      }
      throw error
    }
  })

  app.post('/certificate-templates/:id/clone', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificate-templates'],
      summary: 'Clona um modelo de certificado',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const source = await prisma.certificateTemplate.findUnique({ where: { id } })
    if (!source) return reply.status(404).send({ error: 'Modelo não encontrado.' })

    const template = await prisma.certificateTemplate.create({
      data: {
        name: `${source.name} (cópia)`,
        pageSize: source.pageSize,
        background: source.background,
        backgroundColor: source.backgroundColor,
        elements: source.elements as Prisma.InputJsonValue,
        isDefault: false,
        createdById: request.session.user.id,
      },
    })

    return reply.status(201).send(template)
  })

  app.post('/certificate-templates/preview', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificate-templates'],
      summary: 'Gera o HTML de pré-visualização de um modelo',
      body: {
        type: 'object',
        required: ['elements'],
        properties: templateBodyProps,
      },
    },
  }, async (request) => {
    const { pageSize, background, backgroundColor, elements } = request.body as TemplateBody

    const template: CertTemplate = {
      pageSize: pageSize === 'A4_PORTRAIT' ? 'A4_PORTRAIT' : 'A4_LANDSCAPE',
      background,
      backgroundColor,
      elements: elements ?? [],
    }

    const html = await renderToHtml(template, sampleData)
    return { html }
  })
}
