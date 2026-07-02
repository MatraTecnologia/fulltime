import type { ReactNode } from 'react'
import { cn } from '../lib/cn.js'

type Accent = 'navy' | 'amber' | 'green' | 'blue' | 'purple'
type TrendDirection = 'up' | 'down' | 'neutral'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  accent?: Accent
  trend?: { value: string; direction?: TrendDirection }
  hint?: string
  className?: string
}

const iconAccents: Record<Accent, string> = {
  navy: 'bg-brand-navy-50 text-brand-navy',
  amber: 'bg-brand-amber/15 text-brand-amber-strong',
  green: 'bg-brand-green/15 text-brand-green-strong',
  blue: 'bg-brand-blue/15 text-brand-blue-strong',
  purple: 'bg-brand-purple/15 text-brand-purple-strong',
}

const trendColors: Record<TrendDirection, string> = {
  up: 'text-brand-green-strong',
  down: 'text-red-600',
  neutral: 'text-muted-foreground',
}

export const StatCard = ({
  label,
  value,
  icon,
  accent = 'navy',
  trend,
  hint,
  className,
}: StatCardProps) => (
  <div
    className={cn(
      'flex flex-col gap-4 rounded-card bg-white p-6 shadow-card ring-1 ring-brand-navy/[0.06]',
      className,
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {icon && (
        <span
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5',
            iconAccents[accent],
          )}
        >
          {icon}
        </span>
      )}
    </div>
    <div className="flex flex-col gap-1">
      <span className="font-display text-3xl font-extrabold tracking-tight text-brand-navy">{value}</span>
      <div className="flex items-center gap-2 text-sm">
        {trend && (
          <span className={cn('font-semibold', trendColors[trend.direction ?? 'neutral'])}>
            {trend.value}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  </div>
)
