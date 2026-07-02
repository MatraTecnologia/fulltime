import { Lock, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const RevenueCard = () => (
  <div className="relative flex flex-col justify-between overflow-hidden rounded-card bg-brand-navy p-6 text-white shadow-card">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-brand-amber/20 blur-2xl"
    />
    <div className="relative flex items-start justify-between gap-3">
      <div className="space-y-1">
        <span className="text-sm font-medium text-white/70">Receita</span>
        <p className="font-display text-3xl font-extrabold tracking-tight blur-[3px] select-none">
          R$ 000.000
        </p>
      </div>
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-white/10 text-brand-amber">
        <TrendingUp className="size-5" />
      </span>
    </div>
    <div className="relative mt-6 flex items-center gap-2">
      <Badge className="gap-1 bg-brand-amber/20 text-brand-amber">
        <Lock className="size-3" />
        Em breve
      </Badge>
      <span className="text-xs text-white/60">Disponível com o módulo de pagamentos</span>
    </div>
  </div>
)
