'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { buildChartConfig, chartColors } from '@fulltime/ui'
import type { AdminMetrics } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const formatMonth = (raw: string) => {
  const [, month] = raw.split('-')
  const idx = Number(month) - 1
  return MONTHS[idx] ?? raw
}

const enrollmentsConfig = buildChartConfig([
  { key: 'enrollments', label: 'Matrículas', color: chartColors.amber },
  { key: 'completions', label: 'Conclusões', color: chartColors.green },
])

export const EnrollmentsChart = ({ series }: { series: AdminMetrics['series'] }) => {
  const data = useMemo(() => {
    const map = new Map<string, { month: string; enrollments: number; completions: number }>()
    for (const { month, count } of series.enrollmentsByMonth) {
      map.set(month, { month, enrollments: count, completions: 0 })
    }
    for (const { month, count } of series.completionsByMonth) {
      const row = map.get(month) ?? { month, enrollments: 0, completions: 0 }
      row.completions = count
      map.set(month, row)
    }
    return [...map.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((row) => ({ ...row, label: formatMonth(row.month) }))
  }, [series])

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-base font-bold text-brand-navy">
          Atividade ao longo do tempo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={enrollmentsConfig} className="aspect-[16/7] w-full">
          <AreaChart data={data} margin={{ left: 4, right: 8, top: 4 }}>
            <defs>
              <linearGradient id="fillEnrollments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-enrollments)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-enrollments)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillCompletions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-completions)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--color-completions)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="enrollments"
              type="monotone"
              stroke="var(--color-enrollments)"
              strokeWidth={2}
              fill="url(#fillEnrollments)"
            />
            <Area
              dataKey="completions"
              type="monotone"
              stroke="var(--color-completions)"
              strokeWidth={2}
              fill="url(#fillCompletions)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const roleConfig = buildChartConfig([
  { key: 'profissional', label: 'Profissionais', color: chartColors.green },
  { key: 'instrutor', label: 'Instrutores', color: chartColors.blue },
  { key: 'admin', label: 'Admins', color: chartColors.purple },
])

export const RoleDistributionChart = ({
  usersByRole,
  total,
}: {
  usersByRole: AdminMetrics['usersByRole']
  total: number
}) => {
  const data = useMemo(
    () => [
      { role: 'profissional', value: usersByRole.profissional, fill: chartColors.green },
      { role: 'instrutor', value: usersByRole.instrutor, fill: chartColors.blue },
      { role: 'admin', value: usersByRole.admin, fill: chartColors.purple },
    ],
    [usersByRole],
  )

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-base font-bold text-brand-navy">
          Distribuição por papel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={roleConfig} className="mx-auto aspect-square max-h-[240px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="role" hideLabel />} />
            <Pie data={data} dataKey="value" nameKey="role" innerRadius={62} strokeWidth={4}>
              {data.map((entry) => (
                <Cell key={entry.role} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-brand-navy font-display text-2xl font-extrabold"
                      >
                        {total}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 20}
                        className="fill-muted-foreground text-xs"
                      >
                        usuários
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="role" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
