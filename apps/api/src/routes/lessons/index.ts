import type { FastifyInstance } from 'fastify'
import { Prisma, VideoSource } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'
import { resolveVideo } from '../../lib/video.js'
import { signPlaybackId } from '../../lib/mux.js'

export default async function lessonRoutes(app: FastifyInstance) {
  app.post('/modules/:moduleId/lessons', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['lessons'],
      summary: 'Cria aula no módulo',
      params: {
        type: 'object',
        required: ['moduleId'],
        properties: { moduleId: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          videoSource: { type: 'string', enum: ['MUX', 'YOUTUBE', 'VIMEO', 'NONE'], default: 'NONE' },
          videoRef: { type: 'string' },
          durationSec: { type: 'integer', minimum: 0 },
          order: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { moduleId } = request.params as { moduleId: string }
    const { title, content, videoSource, videoRef, durationSec, order: orderInput } = request.body as {
      title: string
      content?: string
      videoSource?: VideoSource
      videoRef?: string
      durationSec?: number
      order?: number
    }

    let order = orderInput
    if (order === undefined) {
      const agg = await prisma.lesson.aggregate({
        where: { moduleId },
        _max: { order: true },
      })
      order = (agg._max.order ?? 0) + 1
    }

    try {
      const lesson = await prisma.lesson.create({
        data: { moduleId, title, content, videoSource, videoRef, durationSec, order },
      })
      return reply.status(201).send(lesson)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') return reply.status(404).send({ error: 'Módulo não encontrado.' })
      }
      throw error
    }
  })

  app.get('/lessons/:id', {
    preHandler: [requireAuth],
    schema: {
      tags: ['lessons'],
      summary: 'Detalhes da aula',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { attachments: true },
    })

    if (!lesson) return reply.status(404).send({ error: 'Aula não encontrada.' })

    const video = resolveVideo(lesson.videoSource, lesson.videoRef)
    if (video.playbackId) video.token = await signPlaybackId(video.playbackId)

    return { ...lesson, video }
  })

  app.patch('/lessons/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['lessons'],
      summary: 'Atualiza aula',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          videoSource: { type: 'string', enum: ['MUX', 'YOUTUBE', 'VIMEO', 'NONE'], default: 'NONE' },
          videoRef: { type: 'string' },
          durationSec: { type: 'integer', minimum: 0 },
          order: { type: 'integer', minimum: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { title, content, videoSource, videoRef, durationSec, order } = request.body as {
      title?: string
      content?: string
      videoSource?: VideoSource
      videoRef?: string
      durationSec?: number
      order?: number
    }

    try {
      const lesson = await prisma.lesson.update({
        where: { id },
        data: { title, content, videoSource, videoRef, durationSec, order },
      })
      return lesson
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Aula não encontrada.' })
      }
      throw error
    }
  })

  app.delete('/lessons/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['lessons'],
      summary: 'Remove aula',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.lesson.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Aula não encontrada.' })
      }
      throw error
    }
  })

  app.post('/lessons/:lessonId/attachments', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['attachments'],
      summary: 'Adiciona anexo à aula',
      params: {
        type: 'object',
        required: ['lessonId'],
        properties: { lessonId: { type: 'string' } },
      },
      body: {
        type: 'object',
        required: ['name', 'url'],
        properties: {
          name: { type: 'string' },
          url: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string }
    const { name, url, type } = request.body as { name: string; url: string; type?: string }

    try {
      const attachment = await prisma.attachment.create({
        data: { lessonId, name, url, type },
      })
      return reply.status(201).send(attachment)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') return reply.status(404).send({ error: 'Aula não encontrada.' })
      }
      throw error
    }
  })

  app.delete('/attachments/:id', {
    preHandler: [requireAuth, requireRole('admin', 'instrutor')],
    schema: {
      tags: ['attachments'],
      summary: 'Remove anexo',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await prisma.attachment.delete({ where: { id } })
      return reply.status(204).send()
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return reply.status(404).send({ error: 'Anexo não encontrado.' })
      }
      throw error
    }
  })
}
