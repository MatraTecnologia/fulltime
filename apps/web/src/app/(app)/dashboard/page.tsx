'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, CheckCircle2, GraduationCap, PlayCircle } from 'lucide-react'
import { StatCard } from '@fulltime/ui'
import { useSession } from '@/lib/auth-client'
import { apiFetch, ApiError } from '@/lib/api'
import type { EnrollmentListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { ContinueLearning } from '../_components/continue-learning'
import { CourseProgressCard } from '../_components/course-progress-card'
import { DashboardGreeting } from '../_components/dashboard-greeting'
import { DashboardShortcuts } from '../_components/dashboard-shortcuts'

const DashboardPage = () => {
  const router = useRouter()
  const { data: sessionData } = useSession()
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

  const userName = (sessionData?.user as { name?: string } | null | undefined)?.name ?? ''

  const stats = useMemo(() => {
    if (!enrollments) return { active: 0, completed: 0, lessonsCompleted: 0 }
    return {
      active: enrollments.filter((e) => e.status === 'ACTIVE').length,
      completed: enrollments.filter((e) => e.status === 'COMPLETED').length,
      lessonsCompleted: enrollments.reduce((acc, e) => acc + e.progressCount, 0),
    }
  }, [enrollments])

  const continueEnrollment = useMemo(() => {
    if (!enrollments) return null
    const active = enrollments.filter((e) => e.status === 'ACTIVE')
    return active.find((e) => e.progressCount > 0) ?? active[0] ?? null
  }, [enrollments])

  if (!enrollments && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-7 text-brand-navy" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <DashboardGreeting name={userName} />

      {enrollments!.length === 0 ? (
        <Empty className="rounded-card border-none bg-white shadow-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>Nenhum curso ainda</EmptyTitle>
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
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Em andamento"
              value={stats.active}
              accent="blue"
              icon={<PlayCircle />}
              hint="cursos ativos"
            />
            <StatCard
              label="Concluídos"
              value={stats.completed}
              accent="green"
              icon={<CheckCircle2 />}
              hint="cursos finalizados"
            />
            <StatCard
              label="Aulas concluídas"
              value={stats.lessonsCompleted}
              accent="amber"
              icon={<GraduationCap />}
              hint="no total"
            />
          </div>

          {continueEnrollment && <ContinueLearning enrollment={continueEnrollment} />}

          <section aria-labelledby="my-courses" className="space-y-4">
            <h2
              id="my-courses"
              className="font-display text-lg font-bold tracking-tight text-brand-navy"
            >
              Meus cursos
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments!.map((item) => (
                <CourseProgressCard key={item.id} enrollment={item} />
              ))}
            </div>
          </section>
        </>
      )}

      <DashboardShortcuts />
    </div>
  )
}

export default DashboardPage
