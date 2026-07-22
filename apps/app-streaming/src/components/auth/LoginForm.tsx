import { useState } from 'react'
import { signIn, authClient } from '@/lib/auth-client'
import { PasswordField, TextField, FormAlert, Spinner, GoogleButton, Divider, primaryBtnCls, linkCls } from './ui'

const safeNext = () => {
  const raw = new URLSearchParams(window.location.search).get('next')
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/'
  return raw
}

export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [resending, setResending] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setNotice(''); setUnverified(false)
    const { error } = await signIn.email({ email, password, rememberMe: remember })
    setLoading(false)
    if (error) {
      if (error.status === 403) {
        setUnverified(true)
        setError('Seu e-mail ainda não foi verificado. Confira sua caixa de entrada ou reenvie o link abaixo.')
      } else {
        setError(error.message ?? 'E-mail ou senha incorretos. Tente novamente.')
      }
      return
    }
    window.location.assign(safeNext())
  }

  const onResend = async () => {
    setResending(true)
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: `${window.location.origin}/` })
    setResending(false)
    if (error) {
      setError('Não foi possível reenviar agora. Tente novamente em instantes.')
    } else {
      setError(''); setUnverified(false)
      setNotice('E-mail reenviado. Confira sua caixa de entrada (e o spam).')
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">
        <TextField id="email" label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="voce@exemplo.com" required />
        <PasswordField id="password" label="Senha" value={password} onChange={setPassword} autoComplete="current-password" placeholder="••••••••" required />

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-navy/80">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-hairline text-brand-blue accent-brand-blue focus:ring-brand-blue/30" />
            Lembrar de mim
          </label>
          <a href="/recuperar-senha" className={`text-sm ${linkCls}`}>Esqueci minha senha</a>
        </div>

        {error && (
          <FormAlert kind="error">
            <p>{error}</p>
            {unverified && (
              <button type="button" onClick={onResend} disabled={resending} className="text-sm font-semibold underline disabled:opacity-60">
                {resending ? 'Reenviando…' : 'Reenviar e-mail de verificação'}
              </button>
            )}
          </FormAlert>
        )}
        {notice && <FormAlert kind="success"><p>{notice}</p></FormAlert>}

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading && <Spinner />}
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <Divider label="ou" />
      <GoogleButton />

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta? <a href="/cadastro" className={linkCls}>Criar conta</a>
      </p>
      <p className="text-center text-xs text-brand-navy/45">
        Precisa de ajuda? <a href="mailto:matratecnologia@gmail.com" className="font-medium text-brand-navy/60 hover:underline">Falar com o suporte</a>
      </p>
    </div>
  )
}
