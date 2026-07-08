import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma.js'
import { sendEmail } from './mail.js'

const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'
const streamingUrl = process.env.STREAMING_URL ?? 'http://localhost:4321'
const dashboardUrl = process.env.DASHBOARD_URL ?? 'http://localhost:3005'

const brandEmail = (title: string, body: string, cta: { url: string; label: string }) => `
  <div style="max-width:560px;margin:32px auto;font-family:Inter,Arial,sans-serif;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
    <div style="background:#003060;padding:24px;text-align:center">
      <span style="color:#fff;font-size:20px;font-weight:700">Full Time</span>
    </div>
    <div style="padding:32px">
      <h1 style="color:#003060;font-size:18px;margin:0 0 16px">${title}</h1>
      <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">${body}</p>
      <a href="${cta.url}" style="display:inline-block;background:#f5b500;color:#003060;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">${cta.label}</a>
    </div>
  </div>`

export const auth = betterAuth({
  basePath: '/auth',
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3333',
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  advanced: {
    crossSubDomainCookies: {
      enabled: !!process.env.COOKIE_DOMAIN,
      domain: process.env.COOKIE_DOMAIN,
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 14, updateAge: 60 * 60 * 24 },
  user: {
    additionalFields: {
      role: { type: 'string', required: false, defaultValue: 'profissional', input: false },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        await sendEmail({
          to: user.email,
          subject: 'Confirme a alteração de e-mail',
          html: brandEmail('Alterar e-mail', `Recebemos um pedido para alterar seu e-mail para ${newEmail}. Confirme para aplicar a mudança.`, { url, label: 'Confirmar alteração' }),
        })
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Redefinição de senha',
        html: brandEmail('Redefinir senha', 'Recebemos um pedido para redefinir sua senha.', { url, label: 'Redefinir senha' }),
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verifique seu e-mail',
        html: brandEmail(`Bem-vindo, ${user.name}!`, 'Confirme seu e-mail para ativar sua conta na Full Time.', { url, label: 'Verificar e-mail' }),
      })
    },
  },
  trustedOrigins: [frontendUrl, streamingUrl, dashboardUrl, process.env.BETTER_AUTH_URL ?? 'http://localhost:3333'],
})
