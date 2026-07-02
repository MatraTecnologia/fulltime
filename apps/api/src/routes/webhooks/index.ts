import type { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { mux } from '../../lib/mux.js'

type MuxAssetData = {
  id?: string
  asset_id?: string
  passthrough?: string
  duration?: number
  errors?: { messages?: string[] }
  playback_ids?: { id: string; policy: string }[]
}

const matchWhere = (passthrough?: string, assetId?: string) =>
  passthrough ? { id: passthrough } : assetId ? { assetId } : null

export default async function webhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    done(null, body)
  })

  app.post('/webhooks/mux', {
    schema: { tags: ['webhooks'], summary: 'Recebe eventos do Mux' },
  }, async (request, reply) => {
    let event: { type: string; data: MuxAssetData }
    try {
      event = (await mux.webhooks.unwrap(
        request.body as string,
        request.headers,
      )) as { type: string; data: MuxAssetData }
    } catch {
      return reply.status(400).send({ error: 'Assinatura inválida.' })
    }

    const data = event.data ?? {}

    switch (event.type) {
      case 'video.upload.asset_created': {
        if (data.id && data.asset_id) {
          await prisma.videoAsset.updateMany({
            where: { uploadId: data.id, status: { notIn: ['READY', 'ERRORED'] } },
            data: { assetId: data.asset_id, status: 'PROCESSING' },
          })
        }
        break
      }

      case 'video.asset.ready': {
        const where = matchWhere(data.passthrough, data.id)
        const playbackId = data.playback_ids?.[0]?.id ?? null
        const durationSec = typeof data.duration === 'number' ? Math.round(data.duration) : null
        if (where) {
          const asset = await prisma.videoAsset.findFirst({ where })
          if (asset) {
            await prisma.videoAsset.update({
              where: { id: asset.id },
              data: { status: 'READY', assetId: data.id ?? asset.assetId, playbackId, durationSec },
            })
            if (asset.lessonId && playbackId) {
              await prisma.lesson.update({
                where: { id: asset.lessonId },
                data: { videoSource: 'MUX', videoRef: playbackId, durationSec: durationSec ?? undefined },
              })
            }
          }
        }
        break
      }

      case 'video.asset.errored': {
        const where = matchWhere(data.passthrough, data.id)
        if (where) {
          await prisma.videoAsset.updateMany({
            where,
            data: { status: 'ERRORED', error: data.errors?.messages?.join('; ') ?? 'Falha no processamento do vídeo.' },
          })
        }
        break
      }
    }

    return reply.status(200).send({ received: true })
  })
}
