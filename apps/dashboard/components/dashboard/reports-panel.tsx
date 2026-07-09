"use client"

import * as React from "react"
import { Clock, TrendingUp, UserPlus, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/dashboard/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ReportsGrowthChart } from "@/components/dashboard/reports-growth-chart"
import { ReportsCompletionChart } from "@/components/dashboard/reports-completion-chart"
import { ReportsEngagementChart } from "@/components/dashboard/reports-engagement-chart"
import { ReportsEnrollmentsChart } from "@/components/dashboard/reports-enrollments-chart"
import { formatNumber } from "@/lib/utils"
import { useInstructorReports } from "@/hooks/use-reports"

export const ReportsPanel = () => {
  const [tab, setTab] = React.useState("enrollments")
  const { data, isLoading } = useInstructorReports()

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="enrollments">Matrículas</TabsTrigger>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading || !data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Alunos ativos" value={formatNumber(data.stats.activeStudents)} delta={data.stats.activeStudentsDelta} icon={Users} />
            <StatCard label="Novos alunos" value={formatNumber(data.stats.newStudents)} delta={data.stats.newStudentsDelta} icon={UserPlus} />
            <StatCard label="Taxa de conclusão" value={`${data.stats.completionRate}%`} delta={data.stats.completionRateDelta} icon={TrendingUp} />
            <StatCard label="Horas assistidas" value={data.stats.watchedHours} delta={data.stats.watchedHoursDelta} icon={Clock} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <ReportsGrowthChart data={data.studentsGrowth} />
            </div>
            <ReportsCompletionChart data={data.completionBreakdown} />
            <ReportsEngagementChart data={data.weeklyEngagement} />
            <div className="lg:col-span-2">
              <ReportsEnrollmentsChart data={data.monthlyEnrollments} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
