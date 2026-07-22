import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { TextField, FormAlert, Spinner, primaryBtnCls, linkCls } from './ui'

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/redefinir-senha` })
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-5">
        <FormAlert kind="success">
          <p className="font-semibold">Verifique seu e-mail</p>
          <p>Se existir uma conta com <strong>{email}</strong>, enviamos um link para redefinir a senha.</p>
        </FormAlert>
        <a href="/login" className={primaryBtnCls}>Voltar para o login</a>
        <p className="text-center text-sm text-muted-foreground">
          Não recebeu? Confira a caixa de spam ou tente novamente em instantes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField id="email" label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="voce@exemplo.com" required />

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading && <Spinner />}
          {loading ? 'Enviando…' : 'Enviar link'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha? <a href="/login" className={linkCls}>Voltar para o login</a>
      </p>
    </div>
  )
}
