"use client"

import { Cell, Label, Pie, PieChart } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import type { ReportSlice } from "@/services/reports"

const chartConfig: ChartConfig = { value: { label: "Cursos" } }

export const ReportsCompletionChart = ({ data }: { data: ReportSlice[] }) => {
  const main = data[0]?.value ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conclusão dos cursos</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <ChartContainer config={chartConfig} className="aspect-square h-36 w-36 shrink-0">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={46} outerRadius={64} strokeWidth={2} paddingAngle={2}>
              {data.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
              <Label
                content={({ viewBox }) =>
                  viewBox && "cx" in viewBox ? (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                        {main}%
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="flex-1 space-y-2 text-sm">
          {data.map((slice) => (
            <li key={slice.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-muted-foreground">{slice.label}</span>
              </span>
              <span className="font-medium">{slice.value}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
