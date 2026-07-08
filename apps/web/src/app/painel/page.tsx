import type { Metadata } from 'next'
import { OverviewWelcome } from './_components/overview-welcome'
import { QuickActions, RecentActivities } from './_components/overview-side'
import { MyCoursesList } from './_components/overview-courses'
import { CertificatesCard, RatingsCard, StudentsProgressCard } from './_components/overview-metrics'

export const metadata: Metadata = { title: 'Visão Geral — Painel do Instrutor' }

const VisaoGeralPage = () => (
  <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-3">
      <OverviewWelcome className="lg:col-span-2" />
      <QuickActions />
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      <MyCoursesList className="lg:col-span-2" />
      <RecentActivities />
    </div>

    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <StudentsProgressCard />
      <RatingsCard />
      <CertificatesCard />
    </div>
  </div>
)

export default VisaoGeralPage
