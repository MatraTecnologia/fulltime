import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
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

const uploadsDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'public', 'uploads')

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

  app.post('/uploads/image', {
    preHandler: [requireAuth],
    schema: {
      tags: ['uploads'],
      summary: 'Upload de imagem (armazenamento local, servido em /static)',
      body: {
        type: 'object',
        required: ['dataUrl'],
        properties: { dataUrl: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { dataUrl } = request.body as { dataUrl: string }
    const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl)
    if (!match) return reply.status(400).send({ error: 'Imagem inválida.' })

    const contentType = match[1] ?? ''
    const base64 = match[2] ?? ''
    if (!ALLOWED.includes(contentType)) {
      return reply.status(400).send({ error: 'Formato de imagem não suportado.' })
    }

    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length > 8 * 1024 * 1024) {
      return reply.status(413).send({ error: 'Imagem muito grande (máx. 8 MB).' })
    }

    await mkdir(uploadsDir, { recursive: true })
    const name = `${randomUUID()}.${extFromType(contentType)}`
    await writeFile(join(uploadsDir, name), buffer)

    const base = `${request.protocol}://${request.headers.host ?? ''}`
    return reply.status(201).send({ publicUrl: `${base}/static/uploads/${name}` })
  })
}
