import type { LabelHTMLAttributes } from 'react'
import { cn } from '../lib/cn.js'

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('block text-sm font-medium text-brand-navy', className)} {...props} />
)
