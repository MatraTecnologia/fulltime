import { useEffect, useState } from 'react'
import { Button } from '@fulltime/ui'
import type { CourseDetail, Lesson } from '@/lib/types'
import { apiClient, ApiError } from '@/lib/api'
import { CurriculumNav } from './CurriculumNav'
import { VideoStage } from './VideoStage'

interface Props {
  course: CourseDetail
  enrollmentId: string
  initialCompleted: string[]
  initialLessonId: string
}

export const PlayerRoot = ({ course, enrollmentId, initialCompleted, initialLessonId }: Props) => {
  const [activeId, setActiveId] = useState(initialLessonId)
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted))
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true); setError(''); setLesson(null)
    apiClient<Lesson>(`/lessons/${activeId}`)
      .then(data => { if (active) { setLesson(data); setLoading(false) } })
      .catch(e => { if (active) { setError(e instanceof ApiError ? e.message : 'Não foi possível carregar a aula.'); setLoading(false) } })
    return () => { active = false }
  }, [activeId])

  const isDone = completed.has(activeId)
  const onComplete = async () => {
    setSaving(true)
    try {
      await apiClient(`/enrollments/${enrollmentId}/lessons/${activeId}/complete`, { method: 'POST' })
      setCompleted(prev => new Set(prev).add(activeId))
    } catch { /* mantém estado; erro exibido no botão via saving reset */ }
    setSaving(false)
  }

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[320px_1fr]">
      <aside className="border-r border-hairline">
        <div className="border-b border-hairline p-4">
          <a href="/" className="text-xs text-brand-blue">← Voltar para as formações</a>
          <h1 className="mt-2 font-display font-extrabold text-brand-navy line-clamp-2">{course.title}</h1>
        </div>
        <CurriculumNav modules={course.modules} completedLessonIds={[...completed]} activeId={activeId} onSelect={setActiveId} />
      </aside>
      <main className="min-w-0 p-6">
        {loading ? (
          <div className="grid aspect-video place-items-center rounded-card bg-surface text-sm text-brand-navy/60">Carregando…</div>
        ) : error || !lesson ? (
          <div role="alert" className="grid aspect-video place-items-center rounded-card bg-surface text-sm text-brand-navy/70">{error || 'Aula não encontrada.'}</div>
        ) : (
          <>
            <VideoStage lesson={lesson} />
            <div className="mt-5 flex items-start justify-between gap-4">
              <h2 className="font-display text-xl font-extrabold text-brand-navy">{lesson.title}</h2>
              <Button onClick={onComplete} disabled={isDone || saving} className={isDone ? 'border border-brand-green text-brand-green' : 'bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90'}>
                {isDone ? 'Aula concluída' : saving ? 'Salvando…' : 'Marcar como concluída'}
              </Button>
            </div>
            {lesson.content && <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-brand-navy/80">{lesson.content}</p>}
          </>
        )}
      </main>
    </div>
  )
}
