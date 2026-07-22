import { useState } from 'react'
import { Avatar, Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@fulltime/ui'
import { authClient } from '@/lib/auth-client'
import { IconSettings } from '@/components/icons'
import { PreferencesModal } from './PreferencesModal'

interface User {
  id: string
  name: string
  email: string
  role: string
  image: string | null
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  instrutor: 'Instrutor',
  profissional: 'Profissional',
}

interface Props {
  user: User
}

export const ProfilePage = ({ user }: Props) => {
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  const [name, setName] = useState(user.name)
  const [nameLoading, setNameLoading] = useState(false)
  const [nameFeedback, setNameFeedback] = useState('')
  const [nameError, setNameError] = useState('')

  const [email, setEmail] = useState(user.email)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState('')
  const [emailError, setEmailError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const onSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameLoading(true); setNameError(''); setNameFeedback('')
    const { error } = await authClient.updateUser({ name })
    setNameLoading(false)
    if (error) { setNameError(error.message ?? 'Não foi possível salvar o nome.'); return }
    setNameFeedback('Nome atualizado.')
  }

  const onChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true); setEmailError(''); setEmailFeedback('')
    const { error } = await authClient.changeEmail({ newEmail: email, callbackURL: `${window.location.origin}/perfil` })
    setEmailLoading(false)
    if (error) { setEmailError(error.message ?? 'Não foi possível alterar o e-mail.'); return }
    setEmailFeedback('Enviamos um link de confirmação para seu e-mail atual.')
  }

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(''); setPasswordFeedback('')
    if (newPassword !== confirmPassword) { setPasswordError('A confirmação não confere com a nova senha.'); return }
    setPasswordLoading(true)
    const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })
    setPasswordLoading(false)
    if (error) { setPasswordError(error.message ?? 'Não foi possível alterar a senha.'); return }
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    setPasswordFeedback('Senha alterada.')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <Card>
        <div className="flex items-center gap-4 rounded-card bg-brand-navy p-6">
          <Avatar name={user.name} src={user.image} size="md" />
          <div>
            <p className="font-display text-lg font-bold text-white">{user.name}</p>
            <p className="text-sm text-white/70">{ROLE_LABEL[user.role] ?? user.role}</p>
          </div>
          <Button
            onClick={() => setPreferencesOpen(true)}
            variant="outline"
            size="sm"
            className="ml-auto border-white/30 text-white hover:border-white/50 hover:bg-white/10"
          >
            <IconSettings className="h-4 w-4" />
            Preferências
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dados da conta</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={onSaveName} className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <div className="flex gap-2">
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              <Button type="submit" disabled={nameLoading} size="sm">{nameLoading ? 'Salvando…' : 'Salvar'}</Button>
            </div>
            {nameError && <p role="alert" className="text-sm text-brand-navy/80">{nameError}</p>}
            {nameFeedback && <p className="text-sm text-brand-green-strong">{nameFeedback}</p>}
          </form>

          <form onSubmit={onChangeEmail} className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="flex gap-2">
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" disabled={emailLoading} size="sm">{emailLoading ? 'Enviando…' : 'Alterar e-mail'}</Button>
            </div>
            {emailError && <p role="alert" className="text-sm text-brand-navy/80">{emailError}</p>}
            {emailFeedback && <p className="text-sm text-brand-green-strong">{emailFeedback}</p>}
          </form>

          <div className="space-y-2">
            <Label>Cargo</Label>
            <div>
              <span className="inline-flex items-center rounded-pill bg-brand-navy-50 px-3 py-1 text-sm font-medium text-brand-navy">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Gerenciado pela administração.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Alterar senha</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} />
            </div>
            {passwordError && <p role="alert" className="text-sm text-brand-navy/80">{passwordError}</p>}
            {passwordFeedback && <p className="text-sm text-brand-green-strong">{passwordFeedback}</p>}
            <Button type="submit" disabled={passwordLoading} className="w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
              {passwordLoading ? 'Alterando…' : 'Alterar senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <PreferencesModal open={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </div>
  )
}
