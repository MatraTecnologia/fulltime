import { cn } from '../lib/cn.js'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export const ProgressBar = ({ value, max = 100, className }: ProgressBarProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-2 w-full rounded-full bg-brand-navy/10', className)}
    >
      <div
        className="h-full rounded-full bg-brand-amber transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
