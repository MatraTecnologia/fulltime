import { useEffect, useState } from 'react'
import type { CourseDetail, Lesson } from '@/lib/types'
import { apiClient, ApiError } from '@/lib/api'
import { CurriculumNav } from './CurriculumNav'
import { VideoStage } from './VideoStage'
import { LessonTabs } from './LessonTabs'
import { SidePanel } from './SidePanel'

interface Props {
  course: CourseDetail
  enrollmentId: string
  initialCompleted: string[]
  initialLessonId: string
  previewLesson?: Lesson
}

export const PlayerRoot = ({ course, enrollmentId, initialCompleted, initialLessonId, previewLesson }: Props) => {
  const [activeId, setActiveId] = useState(initialLessonId)
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted))
  const [lesson, setLesson] = useState<Lesson | null>(previewLesson ?? null)
  const [loading, setLoading] = useState(!previewLesson)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [completeError, setCompleteError] = useState('')

  useEffect(() => {
    if (previewLesson) return
    let active = true
    setLoading(true); setError(''); setLesson(null)
    apiClient<Lesson>(`/lessons/${activeId}`)
      .then(d => { if (active) { setLesson(d); setLoading(false) } })
      .catch(e => { if (active) { setError(e instanceof ApiError ? e.message : 'Não foi possível carregar a aula.'); setLoading(false) } })
    return () => { active = false }
  }, [activeId, previewLesson])

  const flat = course.modules.flatMap(m => m.lessons)
  const pct = flat.length ? Math.round((completed.size / flat.length) * 100) : 0
  const idx = flat.findIndex(l => l.id === activeId)
  const nextLesson = idx >= 0 && idx + 1 < flat.length ? flat[idx + 1] : null
  const isDone = completed.has(activeId)

  const onComplete = async () => {
    setSaving(true); setCompleteError('')
    try {
      await apiClient(`/enrollments/${enrollmentId}/lessons/${activeId}/complete`, { method: 'POST' })
      setCompleted(prev => new Set(prev).add(activeId))
    } catch (e) {
      setCompleteError(e instanceof ApiError ? e.message : 'Não foi possível marcar como concluída.')
    }
    setSaving(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
      <aside className="border-b border-hairline bg-white lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="border-b border-hairline p-5">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-navy/60 transition-colors hover:text-brand-navy">
            <span aria-hidden>←</span> Voltar para as formações
          </a>
          <h1 className="mt-3 font-display text-base font-extrabold leading-snug text-brand-navy">{course.title}</h1>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-brand-navy/70">Seu progresso</span>
              <span className="font-semibold text-brand-navy">{pct}% concluído</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-pill bg-surface">
              <div className="h-full rounded-pill bg-brand-green transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <CurriculumNav modules={course.modules} completedLessonIds={[...completed]} activeId={activeId} onSelect={setActiveId} />
      </aside>

      <main className="min-w-0 bg-white">
        {loading ? (
          <div className="grid aspect-video w-full place-items-center bg-brand-navy text-sm text-white/60">Carregando…</div>
        ) : error || !lesson ? (
          <div role="alert" className="grid aspect-video w-full place-items-center bg-surface text-sm text-brand-navy/70">{error || 'Aula não encontrada.'}</div>
        ) : (
          <>
            <VideoStage lesson={lesson} />
            <LessonTabs
              lesson={lesson}
              course={course}
              isDone={isDone}
              saving={saving}
              completeError={completeError}
              onComplete={onComplete}
            />
          </>
        )}
      </main>

      <aside className="border-t border-hairline bg-surface/30 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:border-t-0 lg:border-l">
        {!loading && !error && lesson && <SidePanel lesson={lesson} nextLesson={nextLesson} />}
      </aside>
    </div>
  )
}
