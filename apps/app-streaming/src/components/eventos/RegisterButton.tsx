import { useState } from 'react'
import { apiClient, ApiError } from '@/lib/api'

interface Props { eventId: string; slug: string; initialRegistered: boolean }

export const RegisterButton = ({ eventId, initialRegistered }: Props) => {
  const [registered, setRegistered] = useState(initialRegistered)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onToggle = async () => {
    setLoading(true); setError('')
    try {
      await apiClient(`/events/${eventId}/register`, { method: registered ? 'DELETE' : 'POST' })
      setRegistered(!registered)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível concluir a ação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={loading}
        className={
          registered
            ? 'rounded-pill border border-brand-navy px-6 py-3 font-semibold text-brand-navy transition hover:bg-brand-navy/5 disabled:opacity-60'
            : 'rounded-pill bg-brand-amber px-6 py-3 font-semibold text-brand-navy transition hover:bg-brand-amber/90 disabled:opacity-60'
        }
      >
        {loading
          ? 'Processando…'
          : registered
            ? 'Inscrição confirmada — cancelar'
            : 'Inscrever-se'}
      </button>
      {error && <p role="alert" className="text-sm text-brand-navy/80">{error}</p>}
    </div>
  )
}
