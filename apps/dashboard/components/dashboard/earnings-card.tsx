"use client"

import { Bar, BarChart } from "recharts"
import { ArrowUpRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"
import type { ChartPoint } from "@/types"

const chartConfig: ChartConfig = { value: { label: "Ganhos", color: "var(--chart-1)" } }

export const EarningsCard = ({
  total,
  delta,
  data,
}: {
  total: number
  delta: number
  data: ChartPoint[]
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seus ganhos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight">{formatCurrency(total)}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
              <ArrowUpRight className="size-3.5" />
              {delta}%
              <span className="font-normal text-muted-foreground">vs. mês anterior</span>
            </p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="mt-3 aspect-[16/6] w-full">
          <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
