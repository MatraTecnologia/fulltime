import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn.js'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-navy text-white shadow-soft hover:bg-brand-navy-600 active:translate-y-px',
  accent: 'bg-brand-amber text-brand-navy shadow-soft hover:brightness-[0.97] active:translate-y-px',
  outline: 'border-2 border-brand-navy/15 text-brand-navy hover:border-brand-navy/30 hover:bg-brand-navy-50',
  ghost: 'text-brand-navy hover:bg-brand-navy-50',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-base',
  lg: 'h-12 px-7 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold',
        'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
