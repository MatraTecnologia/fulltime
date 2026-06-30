import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/cn.js'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[100px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-brand-navy',
        'placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-blue focus-visible:border-brand-blue',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
