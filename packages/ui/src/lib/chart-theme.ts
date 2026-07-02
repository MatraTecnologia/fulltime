export const chartColorsHex = {
  amber: '#fdb509',
  green: '#6ba93c',
  blue: '#0d92e1',
  purple: '#8649a5',
  navy: '#032e5b',
} as const

export const chartColors = {
  amber: 'var(--color-brand-amber)',
  green: 'var(--color-brand-green)',
  blue: 'var(--color-brand-blue)',
  purple: 'var(--color-brand-purple)',
  navy: 'var(--color-brand-navy)',
} as const

export const chartPalette = [
  chartColors.amber,
  chartColors.green,
  chartColors.blue,
  chartColors.purple,
] as const

interface ChartSeries {
  key: string
  label: string
  color?: string
}

export const buildChartConfig = (series: ChartSeries[]) =>
  Object.fromEntries(
    series.map((s, i) => [
      s.key,
      { label: s.label, color: s.color ?? chartPalette[i % chartPalette.length] },
    ]),
  )
