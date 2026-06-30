'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, ChevronRight, CheckCircle, PlayCircle, TrendingUp } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { apiFetch, ApiError } from '@/lib/api'
import type { EnrollmentListItem } from '@/lib/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

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
          setError(
            e instanceof ApiError ? e.message : 'Não foi possível carregar os cursos.',
          )
        }
      })
  }, [router])

  const userName =
    (sessionData?.user as { name?: string } | null | undefined)?.name ?? ''

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
        <Spinner className="size-7 text-primary" />
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
    <div className="space-y-8">
      {/* Banner de saudação */}
      <div className="rounded-2xl bg-primary px-6 py-8 sm:px-10">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 ring-2 ring-accent ring-offset-2 ring-offset-primary">
            <AvatarFallback className="bg-white/10 text-primary-foreground text-xl font-bold">
              {userName ? getInitials(userName) : '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-primary-foreground/70">{getGreeting()},</p>
            <h1 className="text-2xl font-bold text-primary-foreground">
              {userName || 'bem-vindo'}
            </h1>
          </div>
        </div>
        <p className="mt-4 text-sm text-primary-foreground/60">
          Continue sua jornada de capacitação em educação inclusiva.
        </p>
      </div>

      {enrollments!.length === 0 ? (
        <Empty className="border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>Nenhum curso ainda</EmptyTitle>
            <EmptyDescription>Explore o catálogo e comece a aprender.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/cursos">Ver cursos</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Em andamento</CardDescription>
                <CardTitle className="text-3xl font-bold text-primary">
                  {stats.active}
                </CardTitle>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
                    <PlayCircle className="size-4 text-primary" />
                  </div>
                </CardAction>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Concluídos</CardDescription>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {stats.completed}
                </CardTitle>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-md bg-accent/20">
                    <CheckCircle className="size-4 text-accent-foreground" />
                  </div>
                </CardAction>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Aulas concluídas</CardDescription>
                <CardTitle className="text-3xl font-bold text-accent">
                  {stats.lessonsCompleted}
                </CardTitle>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <TrendingUp className="size-4" />
                  </div>
                </CardAction>
              </CardHeader>
            </Card>
          </div>

          {/* Continuar de onde parou */}
          {continueEnrollment && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                Continuar de onde parou
              </h2>
              <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="flex flex-col sm:flex-row">
                  {continueEnrollment.course.coverImage ? (
                    <img
                      src={continueEnrollment.course.coverImage}
                      alt={continueEnrollment.course.title}
                      className="h-44 w-full object-cover sm:h-auto sm:w-64 shrink-0"
                    />
                  ) : (
                    <div className="flex h-44 w-full shrink-0 items-center justify-center bg-primary/5 sm:h-auto sm:w-64">
                      <BookOpen className="size-12 text-primary/20" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <Badge className="mb-2 bg-accent/15 text-accent-foreground uppercase tracking-wider text-[10px]">
                        Em andamento
                      </Badge>
                      <h3 className="mt-2 text-xl font-semibold text-foreground">
                        {continueEnrollment.course.title}
                      </h3>
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>
                            {continueEnrollment.progressCount} /{' '}
                            {continueEnrollment.totalLessons} aulas
                          </span>
                        </div>
                        <Progress
                          value={
                            continueEnrollment.totalLessons
                              ? (continueEnrollment.progressCount /
                                  continueEnrollment.totalLessons) *
                                100
                              : 0
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button
                        asChild
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Link href={`/aprender/${continueEnrollment.course.slug}`}>
                          Continuar aula
                          <ChevronRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Grade de matrículas */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Meus cursos</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments!.map((item) => (
                <Link
                  key={item.id}
                  href={`/aprender/${item.course.slug}`}
                  className="group block"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow group-hover:shadow-md">
                    {item.course.coverImage ? (
                      <img
                        src={item.course.coverImage}
                        alt={item.course.title}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-36 w-full items-center justify-center bg-primary/5">
                        <BookOpen className="size-8 text-primary/20" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-foreground">
                          {item.course.title}
                        </h3>
                        {item.status === 'COMPLETED' && (
                          <Badge className="shrink-0 bg-accent text-accent-foreground text-[10px]">
                            Concluído
                          </Badge>
                        )}
                      </div>
                      <div className="mt-auto pt-3 space-y-1">
                        <Progress
                          value={
                            item.totalLessons
                              ? (item.progressCount / item.totalLessons) * 100
                              : 0
                          }
                          className="h-1.5"
                        />
                        <p className="text-xs text-muted-foreground">
                          {item.progressCount} / {item.totalLessons} aulas
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

export default DashboardPage
