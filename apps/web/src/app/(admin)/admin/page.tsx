'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Baby, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react'
import { StatCard } from '@fulltime/ui'
import { apiFetch, ApiError } from '@/lib/api'
import type { AdminMetrics } from '@/lib/types'
import { Spinner } from '@/components/ui/spinner'
import { PageHeader } from '../_components/page-header'
import { RevenueCard } from '../_components/revenue-card'
import { EnrollmentsChart, RoleDistributionChart } from '../_components/metrics-charts'
import { useAdminOnly } from '../_components/use-admin-only'

const AdminOverviewPage = () => {
  const router = useRouter()
  const { isAllowed } = useAdminOnly()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAllowed) return
    apiFetch<AdminMetrics>('/admin/metrics')
      .then(setMetrics)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace('/login')
        else setError(e instanceof ApiError ? e.message : 'Não foi possível carregar as métricas.')
      })
  }, [isAllowed, router])

  if (!isAllowed || (!metrics && !error)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
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

  const m = metrics!

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Visão geral"
        description="Acompanhe o desempenho da plataforma em tempo real."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Usuários"
          value={m.usersTotal}
          icon={<Users />}
          accent="navy"
          hint={`${m.usersActive} ativos`}
        />
        <StatCard
          label="Cursos publicados"
          value={m.courses.published}
          icon={<GraduationCap />}
          accent="blue"
          hint={`${m.courses.draft} em rascunho`}
        />
        <StatCard
          label="Matrículas ativas"
          value={m.enrollments.active}
          icon={<BookOpen />}
          accent="amber"
          hint={`${m.enrollments.total} no total`}
        />
        <StatCard
          label="Conclusões"
          value={m.enrollments.completed}
          icon={<TrendingUp />}
          accent="green"
          hint={`${m.certificatesTotal} certificados`}
        />
        <StatCard
          label="Crianças"
          value={m.childrenTotal}
          icon={<Baby />}
          accent="purple"
          hint="acompanhadas na plataforma"
        />
        <RevenueCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EnrollmentsChart series={m.series} />
        </div>
        <RoleDistributionChart usersByRole={m.usersByRole} total={m.usersTotal} />
      </div>
    </div>
  )
}

export default AdminOverviewPage
