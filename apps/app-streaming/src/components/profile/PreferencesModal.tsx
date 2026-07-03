import { useEffect, useId, useState } from 'react'
import { Button, Checkbox } from '@fulltime/ui'
import { IconX } from '@/components/icons'

interface Prefs {
  emailNotifications: boolean
  weeklyDigest: boolean
  platformNews: boolean
}

const DEFAULT_PREFS: Prefs = {
  emailNotifications: true,
  weeklyDigest: true,
  platformNews: false,
}

// PLACEHOLDER: sem endpoint de preferências — persistência local
const readPrefs = (): Prefs => {
  const raw = localStorage.getItem('prefs')
  if (!raw) return DEFAULT_PREFS
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

interface Props {
  open: boolean
  onClose: () => void
}

export const PreferencesModal = ({ open, onClose }: Props) => {
  const titleId = useId()
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)

  useEffect(() => {
    if (open) setPrefs(readPrefs())
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const onSave = () => {
    // PLACEHOLDER: sem endpoint de preferências — persistência local
    localStorage.setItem('prefs', JSON.stringify(prefs))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-navy/40" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-card bg-white p-6 shadow-lifted"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-lg font-bold text-brand-navy">Preferências</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-brand-navy/50 transition-colors hover:text-brand-navy">
            <IconX className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3">
          <Checkbox
            id="pref-email-notifications"
            label="Notificações por e-mail"
            checked={prefs.emailNotifications}
            onChange={e => setPrefs({ ...prefs, emailNotifications: e.target.checked })}
          />
          <Checkbox
            id="pref-weekly-digest"
            label="Resumo semanal de estudos"
            checked={prefs.weeklyDigest}
            onChange={e => setPrefs({ ...prefs, weeklyDigest: e.target.checked })}
          />
          <Checkbox
            id="pref-platform-news"
            label="Novidades da plataforma"
            checked={prefs.platformNews}
            onChange={e => setPrefs({ ...prefs, platformNews: e.target.checked })}
          />
        </div>
        <Button onClick={onSave} className="mt-6 w-full bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
          Salvar preferências
        </Button>
      </div>
    </div>
  )
}
