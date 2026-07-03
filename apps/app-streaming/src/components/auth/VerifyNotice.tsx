import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { TextField, FormAlert, Spinner, primaryBtnCls, linkCls } from './ui'

export const VerifyNotice = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const onResend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setNotice('')
    const { error } = await authClient.sendVerificationEmail({ email, callbackURL: '/' })
    setLoading(false)
    if (error) {
      setError('Não foi possível reenviar agora. Tente novamente em instantes.')
    } else {
      setNotice('E-mail reenviado. Confira sua caixa de entrada (e o spam).')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue shadow-soft">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m3.5 6.5 7.4 5.3a2 2 0 0 0 2.2 0l7.4-5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="mt-4 text-sm text-muted-foreground">
          Enviamos um link de confirmação para o seu e-mail. Abra a mensagem e clique no link para ativar sua conta.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Não recebeu? Informe seu e-mail abaixo para reenviar.
        </p>
      </div>

      <form onSubmit={onResend} className="space-y-4">
        <TextField id="email" label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" placeholder="voce@exemplo.com" required />

        {error && <FormAlert kind="error"><p>{error}</p></FormAlert>}
        {notice && <FormAlert kind="success"><p>{notice}</p></FormAlert>}

        <button type="submit" disabled={loading} className={primaryBtnCls}>
          {loading && <Spinner />}
          {loading ? 'Reenviando…' : 'Reenviar e-mail'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <a href="/login" className={linkCls}>Voltar para o login</a>
      </p>
    </div>
  )
}
