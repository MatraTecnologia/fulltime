import { cn, CategoryBadge } from '@fulltime/ui'
import type { AcompanhamentoResponsavel, ChildRecordType } from '@/lib/types'
import { formatDate, formatDateLong } from './format-date'

type Color = 'green' | 'blue' | 'purple'

const types: Record<ChildRecordType, { label: string; color: Color; emoji: string; dot: string }> = {
  EVOLUCAO: { label: 'Evolução', color: 'green', emoji: '🌱', dot: 'bg-brand-green' },
  SESSAO: { label: 'Sessão', color: 'blue', emoji: '💬', dot: 'bg-brand-blue' },
  PEI: { label: 'PEI', color: 'purple', emoji: '📋', dot: 'bg-brand-purple' },
}

const order: ChildRecordType[] = ['EVOLUCAO', 'SESSAO', 'PEI']

export const ResponsavelView = ({ data }: { data: AcompanhamentoResponsavel }) => {
  const { child, records } = data
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  const counts = order.map((t) => ({ type: t, count: records.filter((r) => r.type === t).length }))

  return (
    <div className="flex flex-col gap-8">
      <header className="rounded-card bg-white p-8 shadow-card ring-1 ring-brand-navy/[0.06]">
        <p className="text-sm font-bold uppercase tracking-wide text-brand-blue-strong">
          Acompanhamento
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-navy sm:text-4xl">
          {child.name}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {child.birthDate && (
            <span className="rounded-pill bg-brand-navy-50 px-3 py-1 text-sm text-brand-navy">
              Nascimento: {formatDate(child.birthDate)}
            </span>
          )}
          {child.diagnosis && (
            <span className="rounded-pill bg-brand-navy-50 px-3 py-1 text-sm text-brand-navy">
              {child.diagnosis}
            </span>
          )}
        </div>
      </header>

      {records.length > 0 && (
        <ul role="list" className="grid grid-cols-3 gap-3">
          {counts.map(({ type, count }) => {
            const t = types[type]
            return (
              <li
                key={type}
                className="flex flex-col items-center gap-1 rounded-card bg-white p-4 text-center shadow-card ring-1 ring-brand-navy/[0.06]"
              >
                <span className="text-2xl" aria-hidden>{t.emoji}</span>
                <span className="font-display text-2xl font-extrabold text-brand-navy">{count}</span>
                <span className="text-xs font-semibold text-muted-foreground">{t.label}</span>
              </li>
            )
          })}
        </ul>
      )}

      <section aria-labelledby="registros-title" className="flex flex-col gap-4">
        <h2 id="registros-title" className="font-display text-xl font-extrabold text-brand-navy">
          Registros
        </h2>

        {sorted.length === 0 ? (
          <div className="rounded-card bg-white p-8 text-center shadow-card ring-1 ring-brand-navy/[0.06]">
            <span className="text-4xl" aria-hidden>📖</span>
            <p className="mt-3 font-display text-lg font-bold text-brand-navy">Ainda sem registros</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Assim que houver novidades no acompanhamento, elas aparecem aqui.
            </p>
          </div>
        ) : (
          <ul role="list" className="flex flex-col">
            {sorted.map((record, i) => {
              const t = types[record.type]
              const last = i === sorted.length - 1
              return (
                <li key={record.id} className="flex gap-4">
                  <div className="flex flex-col items-center pt-6">
                    <span className={cn('size-3 shrink-0 rounded-full', t.dot)} aria-hidden />
                    {!last && <span className="mt-1 w-0.5 flex-1 rounded-pill bg-brand-navy/10" aria-hidden />}
                  </div>
                  <div className="mb-4 flex-1 rounded-card bg-white p-5 shadow-card ring-1 ring-brand-navy/[0.06]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CategoryBadge color={t.color}>
                        <span className="mr-1" aria-hidden>{t.emoji}</span>
                        {t.label}
                      </CategoryBadge>
                      <time className="text-xs font-medium text-muted-foreground">
                        {formatDateLong(record.date)}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-navy">
                      {record.content}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
