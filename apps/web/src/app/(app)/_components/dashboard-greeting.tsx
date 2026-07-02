import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export const DashboardGreeting = ({ name }: { name: string }) => (
  <div className="overflow-hidden rounded-card bg-brand-navy px-6 py-8 shadow-card sm:px-10">
    <div className="flex items-center gap-4">
      <Avatar className="size-14 ring-2 ring-brand-amber ring-offset-2 ring-offset-brand-navy">
        <AvatarFallback className="bg-white/10 font-display text-lg font-bold text-white">
          {name ? getInitials(name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-white/60">{getGreeting()},</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">
          {name || 'bem-vindo'}
        </h1>
      </div>
    </div>
    <p className="mt-4 max-w-xl text-sm text-white/60">
      Continue sua jornada de capacitação em educação inclusiva.
    </p>
  </div>
)
