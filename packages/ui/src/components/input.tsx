import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn.js'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-brand-navy',
        'placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-blue focus-visible:border-brand-blue',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
