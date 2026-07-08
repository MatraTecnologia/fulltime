import Link from 'next/link'
import { Award } from 'lucide-react'
import { SectionCard, RatingStars } from '@/components/panel/primitives'
import { Donut } from '@/components/panel/donut'
import { certificatesSummary, ratingsBreakdown, studentsProgress } from '@/lib/panel/data'

const seeAll = (href: string) => (
  <Link href={href} className="text-sm font-medium text-blue-600 hover:underline">
    Ver relatório
  </Link>
)

export const StudentsProgressCard = () => (
  <SectionCard title="Progresso dos alunos" action={seeAll('/painel/relatorios')}>
    <p className="text-xs text-muted-foreground">Taxa de conclusão geral</p>
    <div className="mt-1 grid grid-cols-[1fr_auto] items-center gap-2">
      <Donut
        centerValue={`${studentsProgress.completion}%`}
        segments={[
          { key: 'concluido', label: 'Concluídos', value: studentsProgress.concluido, color: '#2563eb' },
          { key: 'andamento', label: 'Em andamento', value: studentsProgress.emAndamento, color: '#93c5fd' },
          { key: 'nao', label: 'Não iniciado', value: studentsProgress.naoIniciado, color: '#e2e9f0' },
        ]}
        className="aspect-square max-h-[150px]"
        innerRadius={46}
      />
      <ul className="space-y-2 text-xs">
        {[
          { c: '#2563eb', l: 'Concluídos', v: studentsProgress.concluido },
          { c: '#93c5fd', l: 'Em andamento', v: studentsProgress.emAndamento },
          { c: '#e2e9f0', l: 'Não iniciado', v: studentsProgress.naoIniciado },
        ].map((r) => (
          <li key={r.l} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: r.c }} />
            <span className="text-muted-foreground">{r.l}</span>
            <span className="ml-auto font-semibold text-brand-navy">{r.v}%</span>
          </li>
        ))}
      </ul>
    </div>
  </SectionCard>
)

export const RatingsCard = () => (
  <SectionCard title="Avaliações dos alunos">
    <div className="flex items-center gap-3">
      <span className="font-display text-4xl font-extrabold text-brand-navy">{ratingsBreakdown.average}</span>
      <div>
        <RatingStars value={ratingsBreakdown.average} />
        <p className="text-xs text-muted-foreground">Com base em {ratingsBreakdown.count} avaliações</p>
      </div>
    </div>
    <ul className="mt-4 space-y-2">
      {ratingsBreakdown.bars.map((b) => (
        <li key={b.stars} className="flex items-center gap-2 text-xs">
          <span className="w-3 text-muted-foreground">{b.stars}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-brand-amber" style={{ width: `${b.pct}%` }} />
          </div>
          <span className="w-8 text-right text-muted-foreground">{b.pct}%</span>
        </li>
      ))}
    </ul>
  </SectionCard>
)

export const CertificatesCard = () => (
  <SectionCard title="Certificados emitidos" action={seeAll('/painel/certificados')}>
    <div className="flex items-start gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-brand-purple">
        <Award className="size-6" />
      </span>
      <div>
        <p className="font-display text-3xl font-extrabold text-brand-navy">{certificatesSummary.total}</p>
        <p className="text-xs text-muted-foreground">Total de certificados emitidos</p>
      </div>
    </div>
    <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-sm">
      <span className="font-semibold text-brand-green">{certificatesSummary.thisMonth}</span>
      <span className="text-xs text-muted-foreground">este mês</span>
      <span className="ml-auto font-semibold text-brand-green">{certificatesSummary.delta}</span>
      <span className="text-xs text-muted-foreground">vs. anterior</span>
    </div>
  </SectionCard>
)
