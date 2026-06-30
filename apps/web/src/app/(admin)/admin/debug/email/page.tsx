'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiFetch, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

type Config = { resendKeySet: boolean; mailFrom: string | null }
type SendResult = { ok: boolean; id?: string | null; error?: string }

const DebugEmailPage = () => {
  const [config, setConfig] = useState<Config | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [to, setTo] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<Config>('/debug/email/config')
      .then(setConfig)
      .catch((e) => {
        setConfigError(e instanceof ApiError ? e.message : 'Não foi possível carregar a configuração.')
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setSendError(null)
    try {
      const result = await apiFetch<SendResult>('/debug/email', {
        method: 'POST',
        body: JSON.stringify({ to }),
      })
      if (result.ok) {
        toast.success(`E-mail enviado com sucesso${result.id ? ` (id: ${result.id})` : ''}.`)
      } else {
        setSendError(result.error ?? 'Falha ao enviar.')
        toast.error(result.error ?? 'Falha ao enviar.')
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Erro inesperado.'
      setSendError(msg)
      toast.error(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-navy">Debug de e-mail</h1>

      <Card>
        <CardContent>
          <CardTitle className="mb-4">Configuração</CardTitle>
          {!config && !configError && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}
          {configError && (
            <p className="text-sm text-destructive" role="alert">
              {configError}
            </p>
          )}
          {config && (
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-medium text-brand-navy">RESEND_API_KEY:</dt>
                <dd className={config.resendKeySet ? 'text-green-600' : 'text-red-600'}>
                  {config.resendKeySet ? 'configurada' : 'não configurada'}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-brand-navy">MAIL_FROM:</dt>
                <dd className="text-slate-600">{config.mailFrom ?? '(não configurado)'}</dd>
              </div>
              {config.mailFrom?.includes('onboarding@resend.dev') && (
                <p className="mt-2 rounded-md bg-amber-50 p-3 text-amber-800" role="alert">
                  Remetente sandbox: só entrega ao e-mail dono da conta Resend. Verifique um domínio em{' '}
                  <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="underline">
                    resend.com/domains
                  </a>
                  .
                </p>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <CardTitle className="mb-4">Enviar e-mail de teste</CardTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="to">Destinatário</Label>
              <Input
                id="to"
                type="email"
                placeholder="email@exemplo.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            {sendError && (
              <p className="text-sm text-destructive" role="alert">
                {sendError}
              </p>
            )}
            <Button type="submit" disabled={sending}>
              {sending ? <Spinner /> : 'Enviar e-mail de teste'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default DebugEmailPage
