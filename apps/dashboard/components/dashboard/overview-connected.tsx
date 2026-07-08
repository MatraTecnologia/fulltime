"use client"

import { TrendingUp, Users, UserCheck, Wallet } from "lucide-react"
import { useInstructorOverview } from "@/hooks/use-overview"
import { useInstructorCourses } from "@/hooks/use-courses"
import { useCurrentUser } from "@/hooks/use-current-user"
import { toCourseRow } from "@/services/courses"
import { getApiErrorMessage } from "@/lib/api"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CoursesListCard } from "@/components/dashboard/courses-list-card"
import { ActivityCard } from "@/components/dashboard/activity-card"
import { CompletionDonut } from "@/components/dashboard/completion-donut"
import { RatingsDistribution } from "@/components/dashboard/ratings-distribution"
import { CertificatesCard } from "@/components/dashboard/certificates-card"
import { EarningsCard } from "@/components/dashboard/earnings-card"
import { OverviewSkeleton } from "@/components/dashboard/skeletons/overview-skeleton"
import { QueryError } from "@/components/dashboard/query-error"
import type { InstructorProfile } from "@/types"

export const OverviewConnected = () => {
  const overview = useInstructorOverview()
  const courses = useInstructorCourses()
  const { user } = useCurrentUser()

  if (overview.isPending || courses.isPending) return <OverviewSkeleton />
  if (overview.isError) {
    return (
      <div className="mx-auto max-w-7xl">
        <QueryError message={getApiErrorMessage(overview.error)} onRetry={() => overview.refetch()} />
      </div>
    )
  }

  const data = overview.data
  const s = data.stats

  const profile: InstructorProfile = {
    id: "me",
    name: user?.name ?? "Instrutor",
    email: user?.email ?? "",
    avatarUrl: user?.avatarUrl ?? null,
    headline: "Instrutor na Full Time",
    rating: data.rating.average,
    ratingCount: data.rating.total,
    verified: false,
  }

  const topCourses = (courses.data ?? []).slice(0, 4).map(toCourseRow)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 md:gap-6">
      <WelcomeCard profile={profile} stats={s} data={data.studentsGrowth} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Novos alunos" value={formatNumber(s.newStudents)} delta={s.newStudentsDelta} icon={Users} />
        <StatCard label="Alunos ativos" value={formatNumber(s.activeStudents)} delta={s.activeStudentsDelta} icon={UserCheck} />
        <StatCard label="Taxa de conclusão" value={`${s.completionRate}%`} delta={s.completionRateDelta} icon={TrendingUp} />
        <StatCard label="Ganhos" value={formatCurrency(s.earnings)} delta={s.earningsDelta} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
          <CoursesListCard courses={topCourses} />
          <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
            <CompletionDonut data={data.completionBreakdown} />
            <RatingsDistribution average={data.rating.average} total={data.rating.total} buckets={data.rating.buckets} />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <QuickActions />
          <ActivityCard items={data.recentActivity} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <CertificatesCard {...data.certificates} />
        <EarningsCard total={s.earnings} delta={s.earningsDelta} data={data.earningsSeries} />
      </div>
    </div>
  )
}
