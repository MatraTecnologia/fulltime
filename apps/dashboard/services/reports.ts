import { api } from "@/lib/api"

export interface ReportPoint {
  label: string
  value: number
}

export interface ReportSlice {
  label: string
  value: number
  color: string
}

export interface ReportStats {
  activeStudents: number
  activeStudentsDelta: number
  newStudents: number
  newStudentsDelta: number
  completionRate: number
  completionRateDelta: number
  watchedHours: string
  watchedHoursDelta: number
}

export interface ApiReports {
  stats: ReportStats
  studentsGrowth: ReportPoint[]
  completionBreakdown: ReportSlice[]
  weeklyEngagement: ReportPoint[]
  monthlyEnrollments: ReportPoint[]
}

export const getInstructorReports = async (): Promise<ApiReports> => {
  const { data } = await api.get<ApiReports>("/instructor/reports")
  return data
}
