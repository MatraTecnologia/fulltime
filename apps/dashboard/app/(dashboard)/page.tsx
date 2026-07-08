import { TrendingUp, Users, UserCheck, Wallet } from "lucide-react"
import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CoursesListCard } from "@/components/dashboard/courses-list-card"
import { ActivityCard } from "@/components/dashboard/activity-card"
import { CompletionDonut } from "@/components/dashboard/completion-donut"
import { RatingsDistribution } from "@/components/dashboard/ratings-distribution"
import { CertificatesCard } from "@/components/dashboard/certificates-card"
import { EarningsCard } from "@/components/dashboard/earnings-card"
import { formatCurrency, formatNumber } from "@/lib/utils"
import {
  certificatesIssued,
  completionBreakdown,
  earningsSeries,
  instructorCourses,
  instructorProfile,
  instructorStats,
  ratingBuckets,
  recentActivity,
  studentsGrowth,
} from "@/lib/mock/instructor"

const OverviewPage = () => {
  const s = instructorStats

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 md:gap-6">
      <WelcomeCard profile={instructorProfile} stats={s} data={studentsGrowth} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Novos alunos" value={formatNumber(s.newStudents)} delta={s.newStudentsDelta} icon={Users} />
        <StatCard label="Alunos ativos" value={formatNumber(s.activeStudents)} delta={s.activeStudentsDelta} icon={UserCheck} />
        <StatCard label="Taxa de conclusão" value={`${s.completionRate}%`} delta={s.completionRateDelta} icon={TrendingUp} />
        <StatCard label="Ganhos" value={formatCurrency(s.earnings)} delta={s.earningsDelta} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
          <CoursesListCard courses={instructorCourses} />
          <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
            <CompletionDonut data={completionBreakdown} />
            <RatingsDistribution average={instructorProfile.rating} total={instructorProfile.ratingCount} buckets={ratingBuckets} />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <QuickActions />
          <ActivityCard items={recentActivity} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <CertificatesCard {...certificatesIssued} />
        <EarningsCard total={s.earnings} delta={s.earningsDelta} data={earningsSeries} />
      </div>
    </div>
  )
}

export default OverviewPage
