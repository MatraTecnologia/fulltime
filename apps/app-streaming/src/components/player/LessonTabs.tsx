import { useState } from 'react'
import type { Lesson } from '@/lib/types'

interface Props { lesson: Lesson; instructorName: string }
const TABS = ['Sobre a aula', 'Transcrição', 'Materiais', 'Atividades', 'Comentários'] as const

export const LessonTabs = ({ lesson, instructorName }: Props) => {
  const [tab, setTab] = useState<typeof TABS[number]>('Sobre a aula')
  return (
    <div className="mt-6">
      <div className="flex gap-6 overflow-x-auto border-b border-hairline text-sm">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 font-medium transition-colors ${tab === t ? 'border-brand-blue text-brand-navy' : 'border-transparent text-brand-navy/60 hover:text-brand-navy'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="py-5 text-sm leading-relaxed text-brand-navy/80">
        {tab === 'Sobre a aula' && (lesson.content ? <p className="whitespace-pre-wrap">{lesson.content}</p> : <p>Instrutor: {instructorName}.</p>)}
        {tab === 'Materiais' && (
          lesson.attachments.length
            ? (
              <ul className="space-y-2">
                {lesson.attachments.map(a => (
                  <li key={a.id}>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">{a.name}</a>
                  </li>
                ))}
              </ul>
            )
            : <p>Nenhum material para esta aula.</p>
        )}
        {/* PLACEHOLDER: sem endpoint — transcrição/atividades/comentários */}
        {tab === 'Transcrição' && <p className="text-brand-navy/50">Transcrição em breve.</p>}
        {tab === 'Atividades' && <p className="text-brand-navy/50">Atividades em breve.</p>}
        {tab === 'Comentários' && <p className="text-brand-navy/50">Comentários em breve.</p>}
      </div>
    </div>
  )
}
