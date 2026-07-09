"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ReportPoint } from "@/services/reports"

const chartConfig: ChartConfig = {
  value: { label: "Alunos", color: "var(--chart-1)" },
}

export const ReportsGrowthChart = ({ data }: { data: ReportPoint[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Crescimento de alunos</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[16/6] w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="value"
              type="natural"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill="url(#fillGrowth)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
