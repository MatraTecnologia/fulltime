import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../lib/cn.js'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-brand-navy',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:border-brand-blue',
        className,
      )}
      {...props}
    />
  ),
)
Select.displayName = 'Select'
