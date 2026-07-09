import type { FastifyInstance } from 'fastify'
import { Prisma } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { mux } from '../../lib/mux.js'
import { requireAuth, requireRole } from '../../lib/session.js'

const CORS_ORIGIN = process.env.FRONTEND_URL ?? 'http://localhost:3000'

export default async function videoRoutes(app: FastifyInstance) {
  app.post('/admin/videos/uploads', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['videos'],
      summary: 'Cria um direct upload no Mux e registra o asset',
      body: {
        type: 'object',
        properties: {
          lessonId: { type: 'string' },
          filename: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { lessonId, filename } = request.body as { lessonId?: string; filename?: string }

    const asset = await prisma.videoAsset.create({
      data: { createdById: request.session.user.id, lessonId, filename },
    })

    try {
      const upload = await mux.video.uploads.create({
        cors_origin: (request.headers.origin as string | undefined) ?? CORS_ORIGIN,
        new_asset_settings: {
          playback_policies: ['signed'],
          passthrough: asset.id,
        },
      })

      const updated = await prisma.videoAsset.update({
        where: { id: asset.id },
        data: { uploadId: upload.id, status: 'UPLOADING' },
      })

      return reply.status(201).send({ id: updated.id, uploadUrl: upload.url })
    } catch (error) {
      await prisma.videoAsset.update({
        where: { id: asset.id },
        data: { status: 'ERRORED', error: error instanceof Error ? error.message : 'Falha ao criar upload no Mux.' },
      })
      return reply.status(502).send({ error: 'Não foi possível iniciar o upload no Mux.' })
    }
  })

  app.get('/admin/videos', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: { tags: ['videos'], summary: 'Fila de vídeos (status/progresso)' },
  }, async (request) => {
    const { role, id } = request.session.user
    const where = role === 'admin' ? {} : { createdById: id }

    return prisma.videoAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { lesson: { select: { id: true, title: true } } },
    })
  })

  app.get('/admin/videos/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['videos'],
      summary: 'Status de um vídeo (polling)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const asset = await prisma.videoAsset.findUnique({
      where: { id },
      include: { lesson: { select: { id: true, title: true } } },
    })
    if (!asset) return reply.status(404).send({ error: 'Vídeo não encontrado.' })
    return asset
  })

  app.delete('/admin/videos/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['videos'],
      summary: 'Remove o vídeo (Mux + registro)',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const asset = await prisma.videoAsset.findUnique({ where: { id } })
    if (!asset) return reply.status(404).send({ error: 'Vídeo não encontrado.' })

    if (asset.lessonId && asset.playbackId) {
      await prisma.lesson.updateMany({
        where: { id: asset.lessonId, videoSource: 'MUX', videoRef: asset.playbackId },
        data: { videoSource: 'NONE', videoRef: null },
      })
    }

    if (asset.assetId) {
      try {
        await mux.video.assets.delete(asset.assetId)
      } catch {
        // asset já removido no Mux — segue com a limpeza local
      }
    }

    try {
      await prisma.videoAsset.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Vídeo não encontrado.' })
      }
      throw error
    }
  })
}
