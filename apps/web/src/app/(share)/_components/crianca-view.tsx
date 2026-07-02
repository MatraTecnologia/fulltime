import { CheckCircle2, Lock, Sparkles } from 'lucide-react'
import { cn, ProgressBar } from '@fulltime/ui'
import type { AcompanhamentoCrianca } from '@/lib/types'
import { formatDate } from './format-date'

const worlds = [
  { fill: 'bg-brand-amber', tint: 'bg-brand-amber/15', emoji: '⭐' },
  { fill: 'bg-brand-green', tint: 'bg-brand-green/15', emoji: '🌱' },
  { fill: 'bg-brand-blue', tint: 'bg-brand-blue/15', emoji: '🚀' },
  { fill: 'bg-brand-purple', tint: 'bg-brand-purple/15', emoji: '🎨' },
]

export const CriancaView = ({ data }: { data: AcompanhamentoCrianca }) => {
  const { child, progress, milestones, achievements } = data
  const earned = achievements.filter((a) => a.earned).length

  return (
    <div className="flex flex-col gap-8">
      <header className="rounded-card bg-white p-8 text-center shadow-card ring-1 ring-brand-navy/[0.06]">
        <span className="text-5xl" aria-hidden>🎉</span>
        <p className="mt-3 text-sm font-bold uppercase tracking-wide text-brand-blue-strong">
          Minha jornada
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-navy sm:text-4xl">
          {child.name}
        </h1>
        <p className="mt-6 text-sm font-semibold text-muted-foreground">Você já conquistou</p>
        <p className="font-display text-6xl font-extrabold leading-none text-brand-navy">
          {progress.totalMilestones}
        </p>
        <p className="mt-1 text-base font-bold text-brand-navy">
          {progress.totalMilestones === 1 ? 'marco incrível' : 'marcos incríveis'}
        </p>
      </header>

      <section aria-labelledby="mundos-title" className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="mundos-title" className="font-display text-xl font-extrabold text-brand-navy">
            Meus mundos
          </h2>
          {achievements.length > 0 && (
            <span className="rounded-pill bg-brand-navy-50 px-3 py-1 text-sm font-semibold text-brand-navy">
              {earned} de {achievements.length}
            </span>
          )}
        </div>

        {achievements.length > 0 && (
          <ProgressBar value={earned} max={achievements.length} />
        )}

        {achievements.length === 0 ? (
          <div className="rounded-card bg-white p-8 text-center shadow-card ring-1 ring-brand-navy/[0.06]">
            <span className="text-4xl" aria-hidden>🧭</span>
            <p className="mt-3 font-display text-lg font-bold text-brand-navy">A aventura vai começar!</p>
            <p className="mt-1 text-sm text-muted-foreground">Em breve novos mundos para explorar.</p>
          </div>
        ) : (
          <ul role="list" className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {achievements.map((a, i) => {
              const world = worlds[i % worlds.length]!
              return (
                <li
                  key={a.key}
                  className="flex flex-col items-center gap-3 rounded-card bg-white p-5 text-center shadow-card ring-1 ring-brand-navy/[0.06]"
                >
                  <span
                    className={cn(
                      'flex size-20 items-center justify-center rounded-full text-4xl',
                      a.earned ? world.fill : cn(world.tint, 'opacity-70 grayscale'),
                    )}
                    aria-hidden
                  >
                    {a.earned ? world.emoji : '🔒'}
                  </span>
                  <p className="font-display text-sm font-extrabold text-brand-navy">{a.label}</p>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-semibold',
                      a.earned
                        ? 'bg-brand-green/15 text-brand-green-strong'
                        : 'bg-brand-navy-50 text-brand-navy',
                    )}
                  >
                    {a.earned ? (
                      <>
                        <CheckCircle2 className="size-3.5" aria-hidden />
                        Conquistado
                      </>
                    ) : (
                      <>
                        <Lock className="size-3.5" aria-hidden />
                        A conquistar
                      </>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="linha-title" className="flex flex-col gap-4">
        <h2 id="linha-title" className="font-display text-xl font-extrabold text-brand-navy">
          Minha linha do tempo
        </h2>
        {milestones.length === 0 ? (
          <div className="rounded-card bg-white p-8 text-center shadow-card ring-1 ring-brand-navy/[0.06]">
            <span className="text-4xl" aria-hidden>🌟</span>
            <p className="mt-3 font-display text-lg font-bold text-brand-navy">Está só começando!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cada novo marco vai aparecer aqui para comemorarmos juntos.
            </p>
          </div>
        ) : (
          <ul role="list" className="flex flex-col gap-3">
            {milestones.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center gap-4 rounded-card bg-white p-4 shadow-card ring-1 ring-brand-navy/[0.06]"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-amber/15">
                  <Sparkles className="size-5 text-brand-amber-strong" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-base font-extrabold text-brand-navy">
                    Conquista {milestones.length - i}
                  </p>
                  <p className="text-sm text-muted-foreground">{formatDate(m.date)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
