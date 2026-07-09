import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'
import { renderToHtml, type CertElement, type CertTemplate } from '../../lib/certificate-renderer.js'
import { htmlToPdf } from '../../lib/certificate-pdf.js'
import { DEFAULT_TEMPLATE } from '../../lib/certificate-default-template.js'
import { generateCertificateCode } from '../../lib/certificate.js'

const hasOverrides = (overrides: Prisma.JsonValue | null) =>
  overrides != null && typeof overrides === 'object' && Object.keys(overrides).length > 0

type SessionUser = { id: string; role?: string | null }

const guardCertificate = async (
  id: string,
  user: SessionUser
): Promise<{ status: number; error: string } | null> => {
  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { enrollment: { select: { course: { select: { instructorId: true } } } } },
  })
  if (!cert) return { status: 404, error: 'Certificado não encontrado.' }
  if (user.role === 'instrutor' && cert.enrollment.course.instructorId !== user.id) {
    return { status: 403, error: 'Sem permissão sobre este certificado.' }
  }
  return null
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const formatIssueDate = (d: Date) => `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`

const toCertTemplate = (tpl: {
  pageSize: string
  background: string | null
  backgroundColor: string | null
  elements: unknown
}): CertTemplate => ({
  pageSize: tpl.pageSize === 'A4_PORTRAIT' ? 'A4_PORTRAIT' : 'A4_LANDSCAPE',
  background: tpl.background,
  backgroundColor: tpl.backgroundColor,
  elements: (tpl.elements as CertElement[]) ?? [],
})

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

  app.get('/certificates/:code/pdf', {
    schema: {
      tags: ['certificates'],
      summary: 'Gera o PDF do certificado pelo código',
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
        template: true,
        enrollment: {
          include: {
            user: { select: { name: true } },
            course: {
              include: {
                instructor: { select: { name: true } },
                certificateTemplate: true,
                modules: { include: { lessons: { select: { durationSec: true } } } },
              },
            },
          },
        },
      },
    })

    if (!certificate) return reply.status(404).send({ error: 'Certificado não encontrado.' })
    if (certificate.status === 'REVOKED') {
      return reply.status(410).send({ error: 'Certificado revogado.' })
    }

    const { enrollment } = certificate
    const totalSec = enrollment.course.modules.reduce(
      (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0),
      0
    )
    const base = process.env.STREAMING_URL ?? 'http://localhost:4321'
    const overrides = (certificate.overrides as Record<string, string> | null) ?? {}

    const data = {
      studentName: enrollment.user.name,
      courseTitle: enrollment.course.title,
      issueDate: formatIssueDate(certificate.issuedAt),
      code: certificate.code,
      instructorName: enrollment.course.instructor.name,
      courseDurationHours: String(Math.max(1, Math.round(totalSec / 3600))),
      verifyUrl: `${base}/certificados/${certificate.code}`,
      ...overrides,
    }

    const source = certificate.template ?? enrollment.course.certificateTemplate
    const template = source
      ? toCertTemplate(source)
      : toCertTemplate((await prisma.certificateTemplate.findFirst({ where: { isDefault: true } })) ?? DEFAULT_TEMPLATE_ROW)

    const html = await renderToHtml(template, data)
    const pdf = await htmlToPdf(html, template.pageSize)

    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `inline; filename="certificado-${certificate.code}.pdf"`)
      .send(pdf)
  })

  app.get('/certificates/manage/list', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificates'],
      summary: 'Lista certificados emitidos dos cursos do instrutor',
    },
  }, async (request) => {
    const user = request.session.user
    const where = user.role === 'instrutor'
      ? { enrollment: { course: { instructorId: user.id } } }
      : {}

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        enrollment: {
          include: {
            user: { select: { id: true, name: true } },
            course: { select: { id: true, title: true, slug: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    })

    return certificates.map(({ id, code, issuedAt, status, overrides, enrollment }) => ({
      id,
      code,
      issuedAt,
      status,
      student: enrollment.user,
      course: enrollment.course,
      hasOverrides: hasOverrides(overrides),
    }))
  })

  app.get('/certificates/manage/eligible', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificates'],
      summary: 'Lista matrículas concluídas sem certificado',
    },
  }, async (request) => {
    const user = request.session.user
    const courseWhere = user.role === 'instrutor' ? { instructorId: user.id } : {}

    const enrollments = await prisma.enrollment.findMany({
      where: { certificate: null, course: courseWhere },
      include: {
        user: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
        _count: { select: { progress: true } },
      },
    })

    const withTotals = await Promise.all(
      enrollments.map(async (e) => {
        const total = await prisma.lesson.count({ where: { module: { courseId: e.courseId } } })
        return { enrollment: e, total, completed: e._count.progress }
      })
    )

    return withTotals
      .filter(({ total, completed }) => total > 0 && completed === total)
      .map(({ enrollment }) => ({
        enrollmentId: enrollment.id,
        student: enrollment.user,
        course: enrollment.course,
      }))
  })

  app.post('/certificates/manage/issue', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificates'],
      summary: 'Emite certificado manualmente para uma matrícula',
      body: {
        type: 'object',
        required: ['enrollmentId'],
        properties: { enrollmentId: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { enrollmentId } = request.body as { enrollmentId: string }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { select: { certificateTemplateId: true, instructorId: true } } },
    })
    if (!enrollment) return reply.status(404).send({ error: 'Matrícula não encontrada.' })

    const user = request.session.user
    if (user.role === 'instrutor' && enrollment.course.instructorId !== user.id) {
      return reply.status(403).send({ error: 'Sem permissão sobre esta matrícula.' })
    }

    try {
      const certificate = await prisma.certificate.create({
        data: {
          enrollmentId,
          code: generateCertificateCode(),
          templateId: enrollment.course.certificateTemplateId,
        },
      })
      return reply.status(201).send(certificate)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return reply.status(409).send({ error: 'Certificado já emitido para esta matrícula.' })
      }
      throw error
    }
  })

  app.post('/certificates/:id/revoke', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificates'],
      summary: 'Revoga um certificado',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const guard = await guardCertificate(id, request.session.user)
    if (guard) return reply.status(guard.status).send({ error: guard.error })

    return prisma.certificate.update({ where: { id }, data: { status: 'REVOKED' } })
  })

  app.post('/certificates/:id/reissue', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificates'],
      summary: 'Reemite um certificado revogado',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const guard = await guardCertificate(id, request.session.user)
    if (guard) return reply.status(guard.status).send({ error: guard.error })

    return prisma.certificate.update({
      where: { id },
      data: { status: 'ISSUED', issuedAt: new Date() },
    })
  })

  app.patch('/certificates/:id/overrides', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificates'],
      summary: 'Atualiza os overrides de um certificado',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['overrides'],
        properties: { overrides: { type: 'object' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { overrides } = request.body as { overrides: Record<string, unknown> }

    const guard = await guardCertificate(id, request.session.user)
    if (guard) return reply.status(guard.status).send({ error: guard.error })

    return prisma.certificate.update({
      where: { id },
      data: { overrides: overrides as Prisma.InputJsonValue },
    })
  })

  app.get('/certificates/manage/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['certificates'],
      summary: 'Detalhe de um certificado para gestão',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            user: { select: { name: true } },
            course: { select: { title: true, instructorId: true } },
          },
        },
      },
    })

    if (!certificate) return reply.status(404).send({ error: 'Certificado não encontrado.' })

    const user = request.session.user
    if (user.role === 'instrutor' && certificate.enrollment.course.instructorId !== user.id) {
      return reply.status(403).send({ error: 'Sem permissão sobre este certificado.' })
    }

    return {
      id: certificate.id,
      code: certificate.code,
      status: certificate.status,
      issuedAt: certificate.issuedAt,
      overrides: certificate.overrides,
      student: { name: certificate.enrollment.user.name },
      course: { title: certificate.enrollment.course.title },
      templateId: certificate.templateId,
    }
  })
}

const DEFAULT_TEMPLATE_ROW = {
  pageSize: DEFAULT_TEMPLATE.pageSize,
  background: DEFAULT_TEMPLATE.background ?? null,
  backgroundColor: DEFAULT_TEMPLATE.backgroundColor ?? null,
  elements: DEFAULT_TEMPLATE.elements,
}
