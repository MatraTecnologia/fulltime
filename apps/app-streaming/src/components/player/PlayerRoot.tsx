import { useEffect, useState } from 'react'
import { Button } from '@fulltime/ui'
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
}

export const PlayerRoot = ({ course, enrollmentId, initialCompleted, initialLessonId }: Props) => {
  const [activeId, setActiveId] = useState(initialLessonId)
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted))
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [completeError, setCompleteError] = useState('')

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
    setSaving(true); setCompleteError('')
    try {
      await apiClient(`/enrollments/${enrollmentId}/lessons/${activeId}/complete`, { method: 'POST' })
      setCompleted(prev => new Set(prev).add(activeId))
    } catch (e) {
      setCompleteError(e instanceof ApiError ? e.message : 'Não foi possível marcar como concluída.')
    }
    setSaving(false)
  }

  const flat = course.modules.flatMap(m => m.lessons)
  const idx = flat.findIndex(l => l.id === activeId)
  const nextLessonTitle = idx >= 0 && idx + 1 < flat.length ? flat[idx + 1].title : null

  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[300px_1fr_320px]">
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
              <div className="flex flex-col items-end gap-1">
                <Button onClick={onComplete} disabled={isDone || saving} className={isDone ? 'border border-brand-green text-brand-green' : 'bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90'}>
                  {isDone ? 'Aula concluída' : saving ? 'Salvando…' : 'Marcar como concluída'}
                </Button>
                {completeError && <p role="alert" className="text-xs text-brand-navy/80">{completeError}</p>}
              </div>
            </div>
            <LessonTabs lesson={lesson} instructorName={course.instructor.name} />
          </>
        )}
      </main>
      <div className="border-l border-hairline">
        {!loading && !error && lesson && <SidePanel lesson={lesson} nextLessonTitle={nextLessonTitle} />}
      </div>
    </div>
  )
}
