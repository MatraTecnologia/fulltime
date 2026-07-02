import type { ReactNode } from 'react'
import { cn } from '../lib/cn.js'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const EmptyState = ({ title, description, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
    <p className="font-display text-lg font-semibold text-brand-navy">{title}</p>
    {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action}
  </div>
)
