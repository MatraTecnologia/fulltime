import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { authClient } from '@/lib/auth-client'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await authClient.requestPasswordReset({ email, redirectTo: '/redefinir-senha' })
    setLoading(false)
    setSent(true)
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Recuperar senha</CardTitle></CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm text-brand-navy/80">Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
              {loading ? 'Enviando…' : 'Enviar link'}
            </Button>
          </form>
        )}
        <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Voltar para o login</a>
      </CardContent>
    </Card>
  )
}
