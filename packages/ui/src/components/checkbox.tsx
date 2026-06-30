import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn.js'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={cn(
          'h-4 w-4 rounded border-slate-300 accent-brand-amber',
          'focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2',
          className,
        )}
        {...props}
      />
      {label && <span className="text-sm text-brand-navy">{label}</span>}
    </label>
  ),
)
Checkbox.displayName = 'Checkbox'
