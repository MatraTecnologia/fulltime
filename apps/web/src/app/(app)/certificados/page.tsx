'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Award } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { EnrollmentListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { CertificateCard } from '@/components/certificate-card'
import { PageHeader } from '../_components/page-header'

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
        <Spinner className="size-8 text-brand-navy" />
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
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader title="Certificados" description="Conclua um curso para emitir seu certificado." />
        <Empty className="rounded-card border-none bg-white shadow-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Award />
            </EmptyMedia>
            <EmptyTitle>Nenhum curso matriculado</EmptyTitle>
            <EmptyDescription>Explore o catálogo e comece a aprender.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              asChild
              className="bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90"
            >
              <Link href="/catalogo">Ver cursos</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const completed = enrollments!.filter(isComplete)
  const incomplete = enrollments!.filter((e) => !isComplete(e))

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Certificados"
        description={
          completed.length > 0
            ? `${completed.length} curso${completed.length !== 1 ? 's' : ''} concluído${completed.length !== 1 ? 's' : ''} · pronto para emitir.`
            : 'Conclua todos os módulos de um curso para emitir seu certificado.'
        }
      />

      {completed.length > 0 && (
        <section aria-label="Cursos concluídos">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((item) => (
              <CertificateCard key={item.id} enrollment={item} />
            ))}
          </div>
        </section>
      )}

      {incomplete.length > 0 && (
        <section aria-label="Cursos em andamento" className="space-y-4">
          <h2 className="font-display text-lg font-bold tracking-tight text-brand-navy">
            Em andamento
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {incomplete.map((item) => {
              const remaining = item.totalLessons - item.progressCount
              const pct = Math.round((item.progressCount / (item.totalLessons || 1)) * 100)
              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-card bg-white p-5 shadow-card ring-1 ring-brand-navy/[0.06]"
                >
                  <h3 className="font-display font-bold leading-snug text-brand-navy">
                    {item.course.title}
                  </h3>
                  <div className="space-y-1.5">
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {item.progressCount} de {item.totalLessons} aulas concluídas
                    </p>
                  </div>
                  <p className="mt-auto text-xs text-muted-foreground">
                    Falta{remaining !== 1 ? 'm' : ''} {remaining} aula{remaining !== 1 ? 's' : ''} para o certificado.
                  </p>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default CertificadosPage
