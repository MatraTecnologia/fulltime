import { useEffect, useState } from 'react'
import { Button } from '@fulltime/ui'
import type { Lesson, LessonSummary } from '@/lib/types'
import { safeHref } from '@/lib/url'
import { formatDuration } from '@/lib/format'
import { apiClient } from '@/lib/api'

interface Props { lesson: Lesson; nextLesson: LessonSummary | null }

export const SidePanel = ({ lesson, nextLesson }: Props) => {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'Notas' | 'Marcações'>('Notas')

  useEffect(() => {
    let active = true
    setSaved(false)
    apiClient<{ content: string }>(`/lessons/${lesson.id}/note`)
      .then(res => { if (active) setNote(res.content) })
      .catch(() => { if (active) setNote('') })
    return () => { active = false }
  }, [lesson.id])

  const save = () => {
    apiClient(`/lessons/${lesson.id}/note`, { method: 'PUT', body: JSON.stringify({ content: note }) })
      .then(() => setSaved(true))
      .catch(() => setSaved(false))
  }

  return (
    <div className="space-y-5 p-5">
      <div className="flex gap-5 border-b border-hairline text-sm">
        {(['Notas', 'Marcações'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px border-b-2 pb-3 font-medium transition-colors ${tab === t ? 'border-brand-blue text-brand-navy' : 'border-transparent text-brand-navy/55 hover:text-brand-navy'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Notas' ? (
        <section>
          <h3 className="text-sm font-semibold text-brand-navy">Notas da aula</h3>
          <textarea
            value={note}
            onChange={e => { setNote(e.target.value); setSaved(false) }}
            placeholder="Escreva suas anotações…"
            className="mt-2 h-28 w-full resize-none rounded-card border border-hairline bg-white p-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          <div className="mt-2 flex justify-end">
            <Button onClick={save} className="bg-brand-blue px-5 font-semibold text-white hover:bg-brand-blue/90">
              {saved ? 'Nota salva ✓' : 'Salvar nota'}
            </Button>
          </div>
        </section>
      ) : (
        // PLACEHOLDER: sem endpoint de marcações
        <p className="text-sm text-brand-navy/50">Nenhuma marcação ainda.</p>
      )}

      <section className="rounded-card border border-hairline bg-white p-4">
        <h3 className="text-sm font-semibold text-brand-navy">Recursos da aula</h3>
        {lesson.attachments.length ? (
          <ul className="mt-3 space-y-3">
            {lesson.attachments.map(a => {
              const href = safeHref(a.url)
              return (
                <li key={a.id} className="flex items-center gap-3">
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-blue/10 text-[10px] font-bold text-brand-blue">
                    {(a.type ?? 'DOC').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'DOC'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-brand-navy">{a.name}</span>
                    {a.type && <span className="block text-xs text-brand-navy/50">{a.type}</span>}
                  </span>
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Baixar ${a.name}`} className="shrink-0 text-brand-navy/40 hover:text-brand-blue">↓</a>
                  )}
                </li>
              )
            })}
          </ul>
        ) : <p className="mt-2 text-sm text-brand-navy/50">Sem recursos para esta aula.</p>}
      </section>

      {/* PLACEHOLDER: card de suporte estático */}
      <section className="rounded-card border border-hairline bg-white p-4">
        <h3 className="text-sm font-semibold text-brand-navy">Precisa de ajuda?</h3>
        <p className="mt-1 text-xs leading-relaxed text-brand-navy/60">Fale com nosso time de suporte sempre que precisar.</p>
        <Button className="mt-3 w-full bg-brand-blue font-semibold text-white hover:bg-brand-blue/90">Abrir suporte</Button>
      </section>

      {nextLesson && (
        <section className="rounded-card border border-hairline bg-white p-4">
          <h3 className="text-sm font-semibold text-brand-navy">Próxima aula</h3>
          <div className="mt-3 flex items-center gap-3">
            <span aria-hidden className="grid h-12 w-16 shrink-0 place-items-center rounded-lg bg-brand-navy/10 text-brand-navy/40">▶</span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-brand-navy">{nextLesson.title}</p>
              {nextLesson.durationSec != null && <p className="mt-0.5 text-xs text-brand-navy/50">⏱ {formatDuration(nextLesson.durationSec)} min</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
