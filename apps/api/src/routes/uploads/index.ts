import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../../lib/session.js'
import { s3Enabled, createPresignedUpload } from '../../lib/s3.js'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

const extFromType = (type: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif',
  }
  return map[type] ?? 'bin'
}

export default async function uploadRoutes(app: FastifyInstance) {
  app.post('/admin/uploads/cover', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['uploads'],
      summary: 'Gera uma URL assinada (PUT) no S3 para a capa do curso',
      body: {
        type: 'object',
        required: ['contentType'],
        properties: {
          contentType: { type: 'string' },
          filename: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    if (!s3Enabled) {
      return reply.status(503).send({ error: 'Upload de imagem não configurado no servidor.' })
    }

    const { contentType } = request.body as { contentType: string; filename?: string }
    if (!ALLOWED.includes(contentType)) {
      return reply.status(400).send({ error: 'Formato de imagem não suportado.' })
    }

    const key = `courses/covers/${randomUUID()}.${extFromType(contentType)}`
    const { uploadUrl, publicUrl } = await createPresignedUpload(key, contentType)
    return reply.status(201).send({ uploadUrl, publicUrl })
  })
}
