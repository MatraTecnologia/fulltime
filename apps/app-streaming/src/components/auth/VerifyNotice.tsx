import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { authClient } from '@/lib/auth-client'

export const VerifyNotice = () => {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const onResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/' })
    setLoading(false)
    setMsg(error ? 'Não foi possível reenviar agora.' : 'E-mail de verificação reenviado.')
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Verifique seu e-mail</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-brand-navy/80">Confirme seu e-mail pelo link que enviamos. Não recebeu? Reenvie abaixo.</p>
        <form onSubmit={onResend} className="mt-4 space-y-3">
          <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Reenviando…' : 'Reenviar e-mail'}
          </Button>
          {msg && <p className="text-sm text-brand-navy/80">{msg}</p>}
        </form>
        <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Voltar para o login</a>
      </CardContent>
    </Card>
  )
}
