'use client'

import type { ModuleWithLessons } from '@/lib/types'
import { ProgressBar } from '@fulltime/ui'

interface CurriculumNavProps {
  modules: ModuleWithLessons[]
  completedLessonIds: Set<string>
  activeId: string
  onSelect: (lessonId: string) => void
}

export const CurriculumNav = ({ modules, completedLessonIds, activeId, onSelect }: CurriculumNavProps) => {
  const allLessons = modules.flatMap(m => m.lessons)
  const total = allLessons.length
  const completed = allLessons.filter(l => completedLessonIds.has(l.id)).length

  return (
    <nav aria-label="Currículo do curso">
      <div className="mb-4">
        <ProgressBar value={completed} max={total || 1} />
        <p className="mt-1 text-xs text-brand-navy/60">
          {completed} de {total} aulas concluídas
        </p>
      </div>
      <div className="space-y-4">
        {modules.map(m => (
          <div key={m.id}>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-navy/50">
              {m.title}
            </h3>
            <ul role="list" className="space-y-0.5">
              {m.lessons.map(lesson => {
                const isActive = lesson.id === activeId
                const isDone = completedLessonIds.has(lesson.id)
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      aria-current={isActive ? true : undefined}
                      aria-label={isDone ? `${lesson.title} — concluída` : lesson.title}
                      onClick={() => onSelect(lesson.id)}
                      className={[
                        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        isActive
                          ? 'bg-brand-navy text-white'
                          : 'text-brand-navy/70 hover:bg-brand-navy/10 hover:text-brand-navy',
                      ].join(' ')}
                    >
                      {isDone ? (
                        <svg
                          className={['h-4 w-4 shrink-0', isActive ? 'text-brand-amber' : 'text-green-500'].join(' ')}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
