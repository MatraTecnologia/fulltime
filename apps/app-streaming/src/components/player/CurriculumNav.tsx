import { useState } from 'react'
import type { ModuleWithLessons } from '@/lib/types'

interface Props {
  modules: ModuleWithLessons[]
  completedLessonIds: string[]
  activeId: string
  onSelect: (id: string) => void
}

const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const CurriculumNav = ({ modules, completedLessonIds, activeId, onSelect }: Props) => {
  const done = new Set(completedLessonIds)
  const activeModule = modules.find(m => m.lessons.some(l => l.id === activeId))?.id ?? null
  const [openId, setOpenId] = useState<string | null>(activeModule ?? modules[0]?.id ?? null)

  return (
    <nav className="divide-y divide-hairline">
      {modules.map(m => {
        const total = m.lessons.length
        const completed = m.lessons.filter(l => done.has(l.id)).length
        const open = openId === m.id
        const locked = completed === 0 && activeModule !== m.id
        return (
          <div key={m.id}>
            <button
              onClick={() => setOpenId(open ? null : m.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="flex items-center gap-2">
                <span aria-hidden className={`text-[10px] text-brand-navy/40 transition-transform ${open ? 'rotate-90' : ''}`}>▸</span>
                <span className="font-display text-sm font-bold text-brand-navy">{m.title}</span>
              </span>
              {locked ? (
                <span aria-hidden className="text-xs text-brand-navy/40">🔒</span>
              ) : (
                <span className="text-xs text-muted-foreground">{completed}/{total}</span>
              )}
            </button>
            {open && (
              <ul className="pb-2">
                {m.lessons.map(l => {
                  const isActive = l.id === activeId
                  const isDone = done.has(l.id)
                  return (
                    <li key={l.id}>
                      <button
                        onClick={() => onSelect(l.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`flex w-full items-start gap-3 border-l-2 px-4 py-2.5 text-left text-sm ${isActive ? 'border-brand-blue bg-brand-blue/10' : 'border-transparent text-brand-navy/80 hover:bg-surface'}`}
                      >
                        <span className="flex-1">
                          <span className={`line-clamp-2 ${isActive ? 'font-semibold text-brand-navy' : ''}`}>{l.title}</span>
                          {l.durationSec != null && (
                            <span className="mt-0.5 block text-xs text-brand-navy/50">{formatDuration(l.durationSec)}</span>
                          )}
                        </span>
                        <span
                          aria-hidden
                          className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${isDone ? 'bg-brand-green text-white' : 'border border-hairline'}`}
                        >
                          {isDone ? '✓' : ''}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
