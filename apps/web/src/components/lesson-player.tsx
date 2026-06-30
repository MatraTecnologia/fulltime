'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { Lesson } from '@/lib/types'
import { VideoEmbed, Button, Spinner } from '@fulltime/ui'

interface LessonPlayerProps {
  lessonId: string
  enrollmentId: string
  completed: boolean
  onCompleted: (lessonId: string) => void
}

export const LessonPlayer = ({ lessonId, enrollmentId, completed, onCompleted }: LessonPlayerProps) => {
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLesson(null)
    setError(null)
    setLoading(true)
    setCompleteError(null)

    apiFetch<Lesson>(`/lessons/${lessonId}`)
      .then(data => {
        if (!active) return
        setLesson(data)
        setLoading(false)
      })
      .catch(e => {
        if (!active) return
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar a aula.')
          setLoading(false)
        }
      })

    return () => { active = false }
  }, [lessonId, router])

  const handleComplete = async () => {
    setCompleting(true)
    setCompleteError(null)
    try {
      await apiFetch(`/enrollments/${enrollmentId}/lessons/${lessonId}/complete`, { method: 'POST' })
      onCompleted(lessonId)
    } catch (e) {
      setCompleteError(e instanceof ApiError ? e.message : 'Não foi possível marcar como concluída.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-red-600" role="alert">{error ?? 'Aula não encontrada.'}</p>
      </div>
    )
  }

  return (
    <article className="space-y-6">
      <VideoEmbed url={lesson.video.embedUrl} title={lesson.title} />

      {lesson.content && (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-brand-navy/80">
          {lesson.content}
        </div>
      )}

      {lesson.attachments.length > 0 && (
        <section aria-label="Materiais de apoio">
          <h3 className="mb-2 text-sm font-semibold text-brand-navy">Materiais de apoio</h3>
          <ul className="space-y-1">
            {lesson.attachments.map(a => (
              <li key={a.id}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-blue underline hover:no-underline"
                >
                  {a.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex items-center gap-3">
        <Button
          variant={completed ? 'outline' : 'accent'}
          onClick={handleComplete}
          disabled={completed || completing}
          aria-pressed={completed}
        >
          {completed ? 'Aula concluída' : completing ? 'Salvando…' : 'Marcar como concluída'}
        </Button>
        {completeError && (
          <p className="text-sm text-red-600" role="alert">{completeError}</p>
        )}
      </div>
    </article>
  )
}
