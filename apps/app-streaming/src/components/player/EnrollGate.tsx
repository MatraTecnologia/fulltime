import { useState } from 'react'
import { Button } from '@fulltime/ui'
import { apiClient, ApiError } from '@/lib/api'

interface Props { courseId: string; title: string }

export const EnrollGate = ({ courseId, title }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onEnroll = async () => {
    setLoading(true); setError('')
    try {
      await apiClient(`/courses/${courseId}/enroll`, { method: 'POST' })
      window.location.reload()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível matricular.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold text-brand-navy">{title}</h1>
      <p className="mt-2 text-brand-navy/70">Você ainda não está matriculado neste curso.</p>
      <Button onClick={onEnroll} disabled={loading} className="mt-6 bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90">
        {loading ? 'Matriculando…' : 'Matricular-se gratuitamente'}
      </Button>
      {error && <p role="alert" className="mt-3 text-sm text-brand-navy/80">{error}</p>}
    </div>
  )
}
