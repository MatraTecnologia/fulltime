import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { PasswordField, FormAlert, Spinner, primaryBtnCls, linkCls } from './ui'

export const ResetPasswordForm = () => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem. Verifique e tente novamente.'); return }
    const token = new URLSearchParams(window.location.search).get('token') ?? ''
    setLoading(true)
    const { error } = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)
    if (error) { setError(error.message ?? 'Link inválido ou expirado.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="space-y-5">
        <FormAlert kind="success">
          <p className="font-semibold">Senha redefinida</p>
          <p>Sua senha foi atualizada. Já pode entrar com a nova senha.</p>
        </FormAlert>
        <a href="/login" className={primaryBtnCls}>Entrar com a nova senha</a>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <PasswordField id="password" label="Nova senha" value={password} onChange={setPassword} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" required minLength={8} />
        <PasswordField id="confirm" label="Confirmar senha" value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Repita a nova senha" required minLength={8} />

        {error && <FormAlert kind="error"><p>{error}</p></FormAlert>}

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading && <Spinner />}
          {loading ? 'Salvando…' : 'Redefinir senha'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha? <a href="/login" className={linkCls}>Voltar para o login</a>
      </p>
    </div>
  )
}
