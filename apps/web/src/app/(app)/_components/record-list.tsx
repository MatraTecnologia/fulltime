import { Trash2 } from 'lucide-react'
import type { ChildRecord, ChildRecordType } from '@/lib/types'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<ChildRecordType, string> = {
  EVOLUCAO: 'Evolução',
  SESSAO: 'Sessão',
  PEI: 'PEI',
}

const TYPE_CLASSES: Record<ChildRecordType, string> = {
  EVOLUCAO: 'bg-brand-blue/15 text-brand-blue-strong',
  SESSAO: 'bg-brand-green/15 text-brand-green-strong',
  PEI: 'bg-brand-purple/15 text-brand-purple-strong',
}

const DOT_CLASSES: Record<ChildRecordType, string> = {
  EVOLUCAO: 'bg-brand-blue',
  SESSAO: 'bg-brand-green',
  PEI: 'bg-brand-purple',
}

const formatDate = (value: string) => {
  const [y, m, d] = value.slice(0, 10).split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR')
}

interface RecordListProps {
  records: ChildRecord[]
  onDelete: (id: string) => void
}

export const RecordList = ({ records, onDelete }: RecordListProps) => (
  <ol className="relative space-y-4 border-l border-hairline pl-6">
    {records.map((record) => (
      <li key={record.id} className="relative">
        <span
          className={cn(
            'absolute -left-[1.9rem] top-1 size-3 rounded-full ring-4 ring-surface',
            DOT_CLASSES[record.type],
          )}
          aria-hidden
        />
        <article className="rounded-card bg-white p-5 shadow-card ring-1 ring-brand-navy/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold',
                  TYPE_CLASSES[record.type],
                )}
              >
                {TYPE_LABELS[record.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(record.date)}
              </span>
            </div>
            <button
              onClick={() => onDelete(record.id)}
              className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
              aria-label="Excluir registro"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-navy">
            {record.content}
          </p>
        </article>
      </li>
    ))}
  </ol>
)
