export interface ReportPoint {
  label: string
  value: number
}

export interface ReportSlice {
  label: string
  value: number
  color: string
}

export const reportStats = {
  activeStudents: 6214,
  activeStudentsDelta: 12,
  newStudents: 1248,
  newStudentsDelta: 18,
  completionRate: 76,
  completionRateDelta: 4,
  watchedHours: "12.4k",
  watchedHoursDelta: 9,
}

export const studentsGrowth: ReportPoint[] = [
  { label: "Jan", value: 3200 },
  { label: "Fev", value: 3680 },
  { label: "Mar", value: 4120 },
  { label: "Abr", value: 4780 },
  { label: "Mai", value: 5340 },
  { label: "Jun", value: 6214 },
]

export const completionBreakdown: ReportSlice[] = [
  { label: "Concluídos", value: 76, color: "var(--chart-1)" },
  { label: "Em andamento", value: 18, color: "var(--chart-2)" },
  { label: "Não iniciados", value: 6, color: "var(--chart-4)" },
]

export const weeklyEngagement: ReportPoint[] = [
  { label: "Seg", value: 320 },
  { label: "Ter", value: 410 },
  { label: "Qua", value: 380 },
  { label: "Qui", value: 460 },
  { label: "Sex", value: 390 },
  { label: "Sáb", value: 210 },
  { label: "Dom", value: 160 },
]

export const monthlyEnrollments: ReportPoint[] = [
  { label: "Jan", value: 820 },
  { label: "Fev", value: 940 },
  { label: "Mar", value: 1080 },
  { label: "Abr", value: 1160 },
  { label: "Mai", value: 1210 },
  { label: "Jun", value: 1248 },
]
