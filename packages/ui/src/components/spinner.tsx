import { cn } from '../lib/cn.js'

interface SpinnerProps {
  size?: 'sm' | 'md'
  className?: string
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
}

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <span
    role="status"
    aria-label="Carregando"
    className={cn(
      'inline-block animate-spin rounded-full border-2 border-brand-navy/20 border-t-brand-navy',
      sizes[size],
      className,
    )}
  />
)
