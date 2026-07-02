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
      className={cn('h-2.5 w-full overflow-hidden rounded-pill bg-brand-navy/10', className)}
    >
      <div
        className="h-full rounded-pill bg-gradient-to-r from-brand-amber to-brand-amber transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
