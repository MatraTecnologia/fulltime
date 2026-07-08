"use client"

import * as React from "react"
import { Clock, TrendingUp, UserPlus, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatCard } from "@/components/dashboard/stat-card"
import { ReportsGrowthChart } from "@/components/dashboard/reports-growth-chart"
import { ReportsCompletionChart } from "@/components/dashboard/reports-completion-chart"
import { ReportsEngagementChart } from "@/components/dashboard/reports-engagement-chart"
import { ReportsEnrollmentsChart } from "@/components/dashboard/reports-enrollments-chart"
import { formatNumber } from "@/lib/utils"
import {
  completionBreakdown,
  monthlyEnrollments,
  reportStats,
  studentsGrowth,
  weeklyEngagement,
} from "@/lib/mock/reports"

export const ReportsPanel = () => {
  const [tab, setTab] = React.useState("enrollments")

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Alunos ativos" value={formatNumber(reportStats.activeStudents)} delta={reportStats.activeStudentsDelta} icon={Users} />
        <StatCard label="Novos alunos" value={formatNumber(reportStats.newStudents)} delta={reportStats.newStudentsDelta} icon={UserPlus} />
        <StatCard label="Taxa de conclusão" value={`${reportStats.completionRate}%`} delta={reportStats.completionRateDelta} icon={TrendingUp} />
        <StatCard label="Horas assistidas" value={reportStats.watchedHours} delta={reportStats.watchedHoursDelta} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ReportsGrowthChart data={studentsGrowth} />
        </div>
        <ReportsCompletionChart data={completionBreakdown} />
        <ReportsEngagementChart data={weeklyEngagement} />
        <div className="lg:col-span-2">
          <ReportsEnrollmentsChart data={monthlyEnrollments} />
        </div>
      </div>
    </div>
  )
}
