import type { ReactNode } from 'react'
import { cn } from '../lib/cn.js'

type Color = 'navy' | 'amber' | 'green' | 'blue' | 'purple'

const colors: Record<Color, string> = {
  navy: 'bg-brand-navy-50 text-brand-navy',
  amber: 'bg-brand-amber/15 text-brand-amber-strong',
  green: 'bg-brand-green/15 text-brand-green-strong',
  blue: 'bg-brand-blue/15 text-brand-blue-strong',
  purple: 'bg-brand-purple/15 text-brand-purple-strong',
}

export const CategoryBadge = ({ color, children }: { color: Color; children: ReactNode }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-pill px-3 py-1 text-sm font-semibold',
      colors[color],
    )}
  >
    {children}
  </span>
)
