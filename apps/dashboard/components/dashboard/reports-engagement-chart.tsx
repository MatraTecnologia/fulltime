"use client"

import { Bar, BarChart, XAxis } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ReportPoint } from "@/lib/mock/reports"

const chartConfig: ChartConfig = {
  value: { label: "Horas assistidas", color: "var(--chart-1)" },
}

export const ReportsEngagementChart = ({ data }: { data: ReportPoint[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Engajamento semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[16/6] w-full">
          <BarChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
