'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { apiFetch, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'

export const EnrollButton = ({ courseId, slug }: { courseId: string; slug: string }) => {
  const { data, isPending } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isPending) return null

  if (!data?.user) {
    return (
      <Button asChild size="lg" className="mt-6">
        <Link href={`/login?next=/cursos/${slug}`}>Entrar para se matricular</Link>
      </Button>
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
      <Button size="lg" onClick={handleEnroll} disabled={loading}>
        {loading ? 'Matriculando…' : 'Matricular-se'}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
