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
    {description && <p className="text-sm text-slate-500">{description}</p>}
    {action}
  </div>
)
