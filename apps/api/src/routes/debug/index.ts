import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../../lib/session.js'
import { sendEmail } from '../../lib/mail.js'

export default async function debugRoutes(app: FastifyInstance) {
  app.get('/debug/email/config', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: { tags: ['debug'], summary: 'Configuração de e-mail' },
  }, async () => {
    return {
      resendKeySet: !!process.env.RESEND_API_KEY,
      mailFrom: process.env.MAIL_FROM ?? null,
    }
  })

  app.post<{ Body: { to: string } }>('/debug/email', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['debug'],
      summary: 'Envia e-mail de teste',
      body: {
        type: 'object',
        required: ['to'],
        properties: { to: { type: 'string', format: 'email' } },
      },
    },
  }, async (request) => {
    const { to } = request.body
    try {
      const data = await sendEmail({
        to,
        subject: 'Teste de e-mail — Full Time',
        html: '<p>Se você recebeu isto, o envio está funcionando.</p>',
      })
      return { ok: true, id: data?.id ?? null }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'erro desconhecido' }
    }
  })
}
