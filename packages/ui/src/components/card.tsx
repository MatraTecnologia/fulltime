import type { HTMLAttributes } from 'react'
import { cn } from '../lib/cn.js'

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-card bg-white shadow-sm ring-1 ring-black/5', className)} {...props} />
)

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pb-0', className)} {...props} />
)

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-display text-lg font-bold text-brand-navy', className)} {...props} />
)

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props} />
)
