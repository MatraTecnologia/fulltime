import { useEffect, useState } from 'react'
import { Button } from '@fulltime/ui'
import type { Lesson } from '@/lib/types'
import { safeHref } from '@/lib/url'

interface Props { lesson: Lesson; nextLessonTitle: string | null }

export const SidePanel = ({ lesson, nextLessonTitle }: Props) => {
  const key = `nota:${lesson.id}`
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => { setNote(localStorage.getItem(key) ?? ''); setSaved(false) }, [key])

  // PLACEHOLDER: sem endpoint de notas — persistência local até existir API.
  const save = () => { localStorage.setItem(key, note); setSaved(true) }

  return (
    <aside className="space-y-6 p-5">
      <section>
        <h3 className="font-display font-bold text-brand-navy">Notas da aula</h3>
        <textarea
          value={note}
          onChange={e => { setNote(e.target.value); setSaved(false) }}
          placeholder="Escreva suas anotações…"
          className="mt-2 h-28 w-full resize-none rounded-card border border-hairline bg-surface p-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
        <Button onClick={save} className="mt-2 w-full bg-brand-blue font-semibold text-white hover:bg-brand-blue/90">
          {saved ? 'Nota salva ✓' : 'Salvar nota'}
        </Button>
      </section>
      <section className="border-t border-hairline pt-6">
        <h3 className="font-display font-bold text-brand-navy">Recursos da aula</h3>
        {lesson.attachments.length ? (
          <ul className="mt-2 space-y-2">
            {lesson.attachments.map(a => {
              const href = safeHref(a.url)
              return (
                <li key={a.id} className="flex items-center justify-between rounded-card border border-hairline p-3 text-sm">
                  <span className="truncate text-brand-navy">{a.name}</span>
                  {href && <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 text-brand-blue">↓</a>}
                </li>
              )
            })}
          </ul>
        ) : <p className="mt-2 text-sm text-brand-navy/50">Sem recursos.</p>}
      </section>
      {nextLessonTitle && (
        <section className="border-t border-hairline pt-6">
          <h3 className="font-display font-bold text-brand-navy">Próxima aula</h3>
          <p className="mt-2 rounded-card border border-hairline p-3 text-sm text-brand-navy/80">{nextLessonTitle}</p>
        </section>
      )}
    </aside>
  )
}
