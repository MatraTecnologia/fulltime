import Link from 'next/link'
import { BookOpen, Star, Users } from 'lucide-react'
import { SectionCard } from '@/components/panel/primitives'
import { myCoursesMini } from '@/lib/panel/data'

const nf = new Intl.NumberFormat('pt-BR')

export const MyCoursesList = ({ className }: { className?: string }) => (
  <SectionCard
    title="Meus cursos"
    action={
      <Link href="/painel/cursos" className="text-sm font-medium text-blue-600 hover:underline">
        Ver todos
      </Link>
    }
    bodyClassName="p-2"
    className={className}
  >
    <ul className="divide-y divide-border">
      {myCoursesMini.map((c) => (
        <li key={c.title} className="flex items-center gap-4 px-3 py-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-navy-50 to-secondary text-brand-navy">
            <BookOpen className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand-navy">{c.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-brand-amber text-brand-amber" />
                {c.rating > 0 ? c.rating.toFixed(1) : '—'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" />
                {nf.format(c.students)} alunos
              </span>
            </div>
          </div>
          <div className="hidden w-32 shrink-0 sm:block">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Conclusão</span>
              <span className="font-semibold text-brand-navy">{c.completion}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-brand-green" style={{ width: `${c.completion}%` }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  </SectionCard>
)
