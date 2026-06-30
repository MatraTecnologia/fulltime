'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth-client'
import { Button, Card, CardContent, CardTitle, Field, Input } from '@fulltime/ui'

const LoginForm = () => {
  const router = useRouter()
  const next = useSearchParams().get('next') ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn.email({ email, password })
    setLoading(false)
    if (error) return setError(error.message ?? 'Falha no login.')
    router.push(next)
  }

  return (
    <Card>
      <CardContent>
        <CardTitle>Entrar</CardTitle>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Senha" htmlFor="password">
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Entrando…' : 'Entrar'}</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-brand-navy/70">
          <a href="/cadastro" className="hover:underline">Criar conta</a>
          <a href="/recuperar-senha" className="hover:underline">Esqueci a senha</a>
        </div>
      </CardContent>
    </Card>
  )
}

const LoginPage = () => (
  <Suspense>
    <LoginForm />
  </Suspense>
)

export default LoginPage
