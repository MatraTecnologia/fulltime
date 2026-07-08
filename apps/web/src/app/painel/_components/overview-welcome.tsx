import { CalendarDays } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AreaTrend } from '@/components/panel/area-trend'
import { DeltaBadge, RatingStars, StatTile } from '@/components/panel/primitives'
import { instructor, overviewKpis, overviewStats, studentsGrowth } from '@/lib/panel/data'

export const OverviewWelcome = ({ className }: { className?: string }) => (
  <section className={`rounded-xl border border-border bg-card p-5 shadow-card sm:p-6 ${className ?? ''}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-extrabold text-brand-navy">
          Bem-vindo de volta, {instructor.name.split(' ')[0]}! 👋
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui está um resumo do seu desempenho como instrutor.
        </p>
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-brand-navy transition-colors hover:bg-secondary"
      >
        <CalendarDays className="size-4 text-muted-foreground" />
        Últimos 30 dias
      </button>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {instructor.avatar && <AvatarImage src={instructor.avatar} alt={instructor.name} />}
            <AvatarFallback className="bg-brand-navy text-lg font-semibold text-white">JL</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-bold text-brand-navy">{instructor.name}</p>
            <p className="text-sm text-muted-foreground">{instructor.title}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <RatingStars value={instructor.rating} />
              <span className="text-sm font-semibold text-brand-navy">{instructor.rating}</span>
              <span className="text-xs text-muted-foreground">({instructor.ratingCount} avaliações)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
          {overviewStats.map((s) => (
            <StatTile key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2">
          {overviewKpis.map((k) => (
            <div key={k.label} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-extrabold text-brand-navy">{k.value}</span>
                <DeltaBadge delta={k.delta} trend={k.trend} />
              </div>
              <span className="text-xs text-muted-foreground">{k.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <AreaTrend data={studentsGrowth} label="Novos alunos" className="aspect-[16/6] w-full" />
        </div>
      </div>
    </div>
  </section>
)
