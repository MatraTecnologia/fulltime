'use client'

import { Label, Pie, PieChart } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'

export type DonutSegment = { key: string; label: string; value: number; color: string }

export const Donut = ({
  segments,
  centerValue,
  centerLabel,
  className = 'mx-auto aspect-square max-h-[190px]',
  innerRadius = 58,
}: {
  segments: DonutSegment[]
  centerValue?: React.ReactNode
  centerLabel?: string
  className?: string
  innerRadius?: number
}) => {
  const config: ChartConfig = Object.fromEntries(
    segments.map((s) => [s.key, { label: s.label, color: s.color }]),
  )
  const data = segments.map((s) => ({ ...s, fill: s.color }))

  return (
    <ChartContainer config={config} className={className}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="key" innerRadius={innerRadius} strokeWidth={3}>
          {centerValue !== undefined && (
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
                      {String(centerValue)}
                    </tspan>
                    {centerLabel && (
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 20} className="fill-muted-foreground text-xs">
                        {centerLabel}
                      </tspan>
                    )}
                  </text>
                )
              }}
            />
          )}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
