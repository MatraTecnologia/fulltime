import { ArrowDownRight, ArrowUpRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export const SectionCard = ({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) => (
  <section className={cn('rounded-xl border border-border bg-card shadow-soft', className)}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        {typeof title === 'string' ? (
          <h3 className="font-display text-base font-bold text-brand-navy">{title}</h3>
        ) : (
          title
        )}
        {action}
      </div>
    )}
    <div className={cn('p-5', bodyClassName)}>{children}</div>
  </section>
)

export const DeltaBadge = ({ delta, trend }: { delta: string; trend: 'up' | 'down' }) => (
  <span
    className={cn(
      'inline-flex items-center gap-0.5 text-xs font-semibold',
      trend === 'up' ? 'text-brand-green' : 'text-destructive',
    )}
  >
    {trend === 'up' ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
    {delta}
  </span>
)

export const RatingStars = ({ value, className }: { value: number; className?: string }) => (
  <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} de 5`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'size-3.5',
          i < Math.round(value) ? 'fill-brand-amber text-brand-amber' : 'fill-border text-border',
        )}
      />
    ))}
  </span>
)

export const StatTile = ({
  value,
  label,
  className,
}: {
  value: React.ReactNode
  label: string
  className?: string
}) => (
  <div className={cn('flex flex-col gap-0.5', className)}>
    <span className="font-display text-2xl font-extrabold leading-none text-brand-navy">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
)
