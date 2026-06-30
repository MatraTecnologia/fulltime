'use client'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const RecuperarSenhaPage = () => {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/redefinir-senha` })
    setLoading(false)
    if (error) return setError(error.message ?? 'Erro ao solicitar redefinição.')
    setSuccess(true)
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Verifique seu e-mail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Se o e-mail existir em nossa base, enviamos um link para redefinição de senha.
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            <a href="/login" className="hover:text-foreground hover:underline">Voltar para o login</a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recuperar senha</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enviando…' : 'Enviar link'}
          </Button>
        </form>
        <div className="mt-4 text-sm text-muted-foreground">
          <a href="/login" className="hover:text-foreground hover:underline">Voltar para o login</a>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecuperarSenhaPage
