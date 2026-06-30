'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button, Card, CardContent, CardTitle, Field, Input } from '@fulltime/ui'

const RedefinirSenhaForm = () => {
  const router = useRouter()
  const token = useSearchParams().get('token') ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirm) return setError('As senhas não coincidem.')
    setLoading(true); setError('')
    const { error } = await authClient.resetPassword({ newPassword, token })
    setLoading(false)
    if (error) return setError(error.message ?? 'Erro ao redefinir senha.')
    router.push('/login')
  }

  if (!token) {
    return (
      <Card>
        <CardContent>
          <CardTitle>Redefinir senha</CardTitle>
          <p className="mt-4 text-sm text-red-600" role="alert">Link inválido ou expirado.</p>
          <div className="mt-6 text-sm text-brand-navy/70">
            <a href="/recuperar-senha" className="hover:underline">Solicitar novo link</a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <CardTitle>Redefinir senha</CardTitle>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Nova senha" htmlFor="newPassword">
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </Field>
          <Field label="Confirmar senha" htmlFor="confirm">
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Salvando…' : 'Salvar nova senha'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

const RedefinirSenhaPage = () => (
  <Suspense>
    <RedefinirSenhaForm />
  </Suspense>
)

export default RedefinirSenhaPage
