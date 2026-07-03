import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { signIn, authClient } from '@/lib/auth-client'

const safeNext = () => {
  const raw = new URLSearchParams(window.location.search).get('next')
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/'
  return raw
}

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [resending, setResending] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setUnverified(false)
    const { error } = await signIn.email({ email, password })
    setLoading(false)
    if (error) {
      if (error.status === 403) {
        setUnverified(true)
        setError('Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada ou reenvie o link abaixo.')
      } else {
        setError(error.message ?? 'Falha no login.')
      }
      return
    }
    window.location.assign(safeNext())
  }

  const onResend = async () => {
    setResending(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/' })
    setResending(false)
    setError(error ? 'Não foi possível reenviar agora. Tente novamente em instantes.' : 'E-mail reenviado. Confira sua caixa de entrada (e o spam).')
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Entrar</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div role="alert" className="space-y-1">
              <p className="text-sm text-brand-navy/80">{error}</p>
              {unverified && (
                <button type="button" onClick={onResend} disabled={resending} className="text-sm text-brand-blue underline disabled:opacity-60">
                  {resending ? 'Reenviando…' : 'Reenviar e-mail de verificação'}
                </button>
              )}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <a href="/cadastro" className="hover:underline">Criar conta</a>
          <a href="/recuperar-senha" className="hover:underline">Esqueci a senha</a>
        </div>
      </CardContent>
    </Card>
  )
}
