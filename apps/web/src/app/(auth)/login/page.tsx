'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { authClient, signIn } from '@/lib/auth-client'
import { Button, Card, CardContent, CardTitle, Field, Input } from '@fulltime/ui'

const safeNext = (value: string | null) => {
  if (!value || !value.startsWith('/')) return '/dashboard'
  if (value.startsWith('//') || value.includes('\\')) return '/dashboard'
  return value
}

const LoginForm = () => {
  const router = useRouter()
  const next = safeNext(useSearchParams().get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

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
    router.push(next)
  }

  const onResend = async () => {
    setResendLoading(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/dashboard' })
    setResendLoading(false)
    if (error) {
      toast.error('Não foi possível reenviar agora. Tente novamente em instantes.')
    } else {
      toast.success('E-mail de verificação reenviado. Confira sua caixa de entrada (e o spam).')
    }
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
          {error && (
            <div role="alert" className="space-y-2">
              <p className="text-sm text-red-600">{error}</p>
              {unverified && (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resendLoading}
                  className="text-sm font-medium text-brand-navy underline underline-offset-2 disabled:opacity-50"
                >
                  {resendLoading ? 'Reenviando…' : 'Reenviar e-mail de verificação'}
                </button>
              )}
            </div>
          )}
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
