import { api } from "@/lib/api"
import type { ActivityItem, ChartPoint, CompletionSlice, InstructorStats, RatingBucket } from "@/types"

export interface ApiOverview {
  stats: InstructorStats
  rating: { average: number; total: number; buckets: RatingBucket[] }
  completionBreakdown: CompletionSlice[]
  certificates: { total: number; deltaMonth: number; deltaPercentage: number }
  studentsGrowth: ChartPoint[]
  earningsSeries: ChartPoint[]
  recentActivity: ActivityItem[]
}

export const getInstructorOverview = async (): Promise<ApiOverview> => {
  const { data } = await api.get<ApiOverview>("/instructor/overview")
  return data
}
