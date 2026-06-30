'use client'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button, Card, CardContent, CardTitle, Field, Input } from '@fulltime/ui'

const RecuperarSenhaPage = () => {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await authClient.requestPasswordReset({ email, redirectTo: '/redefinir-senha' })
    setLoading(false)
    if (error) return setError(error.message ?? 'Erro ao solicitar redefinição.')
    setSuccess(true)
  }

  if (success) {
    return (
      <Card>
        <CardContent>
          <CardTitle>Verifique seu e-mail</CardTitle>
          <p className="mt-4 text-sm text-brand-navy/70">
            Se o e-mail existir em nossa base, enviamos um link para redefinição de senha.
          </p>
          <div className="mt-6 text-sm text-brand-navy/70">
            <a href="/login" className="hover:underline">Voltar para o login</a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <CardTitle>Recuperar senha</CardTitle>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="E-mail" htmlFor="email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">{loading ? 'Enviando…' : 'Enviar link'}</Button>
        </form>
        <div className="mt-4 text-sm text-brand-navy/70">
          <a href="/login" className="hover:underline">Voltar para o login</a>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecuperarSenhaPage
