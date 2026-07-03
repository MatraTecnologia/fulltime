import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { signUp } from '@/lib/auth-client'

export const SignupForm = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUp.email({ name, email, password, callbackURL: '/' })
    setLoading(false)
    if (error) { setError(error.message ?? 'Não foi possível criar a conta.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-xl">Confirme seu e-mail</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-brand-navy/80">Enviamos um link de verificação para <strong>{email}</strong>. Abra-o para ativar sua conta.</p>
          <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Voltar para o login</a>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">Criar conta</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Nome</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>
          {error && <p role="alert" className="text-sm text-brand-navy/80">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
            {loading ? 'Criando…' : 'Criar conta'}
          </Button>
        </form>
        <a href="/login" className="mt-4 inline-block text-sm text-brand-blue underline">Já tenho conta</a>
      </CardContent>
    </Card>
  )
}
