'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { EnrollmentListItem } from '@/lib/types'
import { Card, CardContent, CardTitle, EmptyState, ProgressBar, Spinner } from '@fulltime/ui'

const DashboardPage = () => {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<EnrollmentListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<EnrollmentListItem[]>('/enrollments')
      .then(setEnrollments)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os cursos.')
        }
      })
  }, [router])

  if (!enrollments && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-600" role="alert">{error}</p>
      </div>
    )
  }

  if (enrollments!.length === 0) {
    return (
      <EmptyState
        title="Nenhum curso ainda"
        description="Explore o catálogo e comece a aprender."
        action={
          <Link
            href="/cursos"
            className="inline-flex items-center justify-center rounded-lg font-display font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 bg-brand-navy text-white hover:bg-brand-navy-600 h-11 px-5 text-base"
          >
            Ver cursos
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Meus cursos</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments!.map((item) => (
          <Link key={item.id} href={`/aprender/${item.course.slug}`} className="block transition hover:-translate-y-0.5">
            <Card>
              {item.course.coverImage && (
                <img
                  src={item.course.coverImage}
                  alt={item.course.title}
                  className="h-36 w-full rounded-t-card object-cover"
                />
              )}
              <CardContent>
                <CardTitle>{item.course.title}</CardTitle>
                <div className="mt-3">
                  <ProgressBar value={item.progressCount} max={item.totalLessons || 1} />
                  <p className="mt-1 text-xs text-brand-navy/60">
                    {item.progressCount} de {item.totalLessons} aulas concluídas
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
