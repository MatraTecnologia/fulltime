import { useState } from 'react'
import { signUp } from '@/lib/auth-client'
import { PasswordField, TextField, FormAlert, Spinner, GoogleButton, Divider, primaryBtnCls, linkCls } from './ui'

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
    const { error } = await signUp.email({ name, email, password, callbackURL: `${window.location.origin}/` })
    setLoading(false)
    if (error) { setError(error.message ?? 'Não foi possível criar a conta.'); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="space-y-5">
        <FormAlert kind="success">
          <p className="font-semibold">Confirme seu e-mail</p>
          <p>Enviamos um link de verificação para <strong>{email}</strong>. Abra-o para ativar sua conta.</p>
        </FormAlert>
        <a href="/login" className={primaryBtnCls}>Voltar para o login</a>
        <p className="text-center text-sm text-muted-foreground">
          Não recebeu? Verifique a caixa de spam ou tente novamente em instantes.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField id="name" label="Nome" value={name} onChange={setName} autoComplete="name" placeholder="Seu nome completo" required />
        <TextField id="email" label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="voce@exemplo.com" required />
        <PasswordField id="password" label="Senha" value={password} onChange={setPassword} autoComplete="new-password" placeholder="Mínimo de 8 caracteres" required minLength={8} />

        {error && <FormAlert kind="error"><p>{error}</p></FormAlert>}

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading && <Spinner />}
          {loading ? 'Criando…' : 'Criar conta'}
        </button>
      </form>

      <Divider label="ou" />
      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta? <a href="/login" className={linkCls}>Entrar</a>
      </p>
      <p className="text-center text-xs text-brand-navy/45">
        Precisa de ajuda? <a href="mailto:matratecnologia@gmail.com" className="font-medium text-brand-navy/60 hover:underline">Falar com o suporte</a>
      </p>
    </div>
  )
}
