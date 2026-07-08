"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { BadgeCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { StarRating } from "@/components/dashboard/star-rating"
import { initials, formatNumber } from "@/lib/utils"
import type { ChartPoint, InstructorProfile, InstructorStats } from "@/types"

const chartConfig: ChartConfig = {
  value: { label: "Novos alunos", color: "var(--chart-1)" },
}

const inlineStat = (label: string, value: string) => (
  <div key={label} className="min-w-24">
    <p className="text-xl font-semibold tracking-tight">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
)

export const WelcomeCard = ({
  profile,
  stats,
  data,
}: {
  profile: InstructorProfile
  stats: InstructorStats
  data: ChartPoint[]
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <Avatar className="size-16">
              {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.name} />}
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {initials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Bem-vindo de volta, {profile.name.split(" ")[0]}! <span aria-hidden>👋</span>
              </h1>
              <p className="text-sm text-muted-foreground">{profile.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StarRating value={profile.rating} />
                <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({profile.ratingCount} avaliações)
                </span>
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <BadgeCheck className="size-3.5" />
                    Instrutor Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {inlineStat("Cursos publicados", String(stats.publishedCourses))}
            {inlineStat("Alunos", formatNumber(stats.totalStudents))}
            {inlineStat("Avaliações positivas", `${stats.positiveRatingRate}%`)}
            {inlineStat("Conteúdo publicado", `${stats.contentHours}h`)}
          </div>
        </div>

        <div className="w-full lg:max-w-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Desempenho</span>
            <Select
              defaultValue="30d"
              items={{ "7d": "Últimos 7 dias", "30d": "Últimos 30 dias", "90d": "Últimos 90 dias" }}
            >
              <SelectTrigger size="sm" className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ChartContainer config={chartConfig} className="aspect-[16/7] w-full">
            <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                dataKey="value"
                type="natural"
                stroke="var(--color-value)"
                strokeWidth={2}
                fill="url(#fillValue)"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  )
}
