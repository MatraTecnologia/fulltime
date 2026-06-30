'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { EnrollmentListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { CertificateCard } from '@/components/certificate-card'

const isComplete = (e: EnrollmentListItem) =>
  e.totalLessons > 0 && e.progressCount === e.totalLessons

const CertificadosPage = () => {
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
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os certificados.')
        }
      })
  }, [router])

  if (!enrollments && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-destructive" role="alert">{error}</p>
      </div>
    )
  }

  if (enrollments!.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Nenhum curso matriculado</EmptyTitle>
          <EmptyDescription>Conclua um curso para emitir seu certificado.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/cursos">Ver cursos</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const completed = enrollments!.filter(isComplete)
  const incomplete = enrollments!.filter((e) => !isComplete(e))

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Certificados</h1>

      {completed.length > 0 ? (
        <section className="mt-6" aria-label="Cursos concluídos">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((item) => (
              <CertificateCard key={item.id} enrollment={item} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-4 text-sm text-brand-navy/60">
          Conclua todos os módulos de um curso para emitir seu certificado.
        </p>
      )}

      {incomplete.length > 0 && (
        <section className="mt-8" aria-label="Cursos em andamento">
          <h2 className="font-display text-lg font-semibold text-brand-navy/70">Em andamento</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {incomplete.map((item) => {
              const remaining = item.totalLessons - item.progressCount
              const pct = Math.round((item.progressCount / (item.totalLessons || 1)) * 100)
              return (
                <Card key={item.id} className="opacity-70">
                  <CardContent>
                    <CardTitle>{item.course.title}</CardTitle>
                    <div className="mt-3">
                      <Progress value={pct} />
                      <p className="mt-1 text-xs text-brand-navy/60">
                        {item.progressCount} de {item.totalLessons} aulas concluídas
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-brand-navy/50">
                      Falta{remaining !== 1 ? 'm' : ''} {remaining} aula{remaining !== 1 ? 's' : ''} para emitir o certificado
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default CertificadosPage
