import { cn } from '../lib/cn.js'

interface AvatarProps {
  name: string
  src?: string | null
  size?: 'sm' | 'md'
}

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')

export const Avatar = ({ name, src, size = 'md' }: AvatarProps) => (
  <span
    className={cn(
      'inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-navy-50 font-semibold text-brand-navy',
      sizes[size],
    )}
  >
    {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : getInitials(name)}
  </span>
)
