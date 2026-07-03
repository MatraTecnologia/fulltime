import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { authClient } from '@/lib/auth-client'

export const ResetPasswordForm = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = new URLSearchParams(window.location.search).get('token') ?? ''
    setLoading(true); setError('')
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)
    if (error) { setError(error.message ?? 'Link inválido ou expirado.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-xl">Senha redefinida</CardTitle></CardHeader>
        <CardContent><a href="/login" className="text-sm text-brand-blue underline">Entrar com a nova senha</a></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Nova senha</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="password">Nova senha</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
          {error && <p role="alert" className="text-sm text-brand-navy/80">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Salvando…' : 'Redefinir senha'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
