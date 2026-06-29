import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendEmail = async (opts: { to: string; subject: string; html: string }) => {
  await resend.emails.send({ from: process.env.MAIL_FROM!, ...opts })
}
