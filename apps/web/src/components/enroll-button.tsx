'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { apiFetch, ApiError } from '@/lib/api'
import { Button } from '@fulltime/ui'

export const EnrollButton = ({ courseId, slug }: { courseId: string; slug: string }) => {
  const { data, isPending } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isPending) return null

  if (!data?.user) {
    return (
      <a
        href={`/login?next=/cursos/${slug}`}
        className="mt-6 inline-flex items-center justify-center rounded-lg font-display font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 bg-brand-navy text-white hover:bg-brand-navy-600 h-11 px-5 text-base"
      >
        Entrar para se matricular
      </a>
    )
  }

  const handleEnroll = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiFetch(`/courses/${courseId}/enroll`, { method: 'POST' })
      router.push(`/aprender/${slug}`)
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setError('Este curso ainda não está disponível para matrícula.')
      } else {
        setError('Não foi possível realizar a matrícula. Tente novamente.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <Button onClick={handleEnroll} disabled={loading}>
        {loading ? 'Matriculando…' : 'Matricular-se'}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
}
