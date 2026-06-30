'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { authClient, signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      <CardHeader>
        <CardTitle className="text-xl">Entrar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div role="alert" className="space-y-1">
              <p className="text-sm text-destructive">{error}</p>
              {unverified && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onResend}
                  disabled={resendLoading}
                  className="h-auto p-0"
                >
                  {resendLoading ? 'Reenviando…' : 'Reenviar e-mail de verificação'}
                </Button>
              )}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <a href="/cadastro" className="hover:text-foreground hover:underline">Criar conta</a>
          <a href="/recuperar-senha" className="hover:text-foreground hover:underline">Esqueci a senha</a>
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
