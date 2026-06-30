'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
        <CardHeader>
          <CardTitle className="text-xl">Redefinir senha</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive" role="alert">Link inválido ou expirado.</p>
          <div className="mt-6 text-sm text-muted-foreground">
            <a href="/recuperar-senha" className="hover:text-foreground hover:underline">Solicitar novo link</a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Redefinir senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar senha</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
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
