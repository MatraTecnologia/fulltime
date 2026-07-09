import { useEffect, useState } from 'react'
import type { CourseDetail, Lesson, LessonComment, LessonRating } from '@/lib/types'
import { safeHref } from '@/lib/url'
import { formatDate, formatDuration } from '@/lib/format'
import { apiClient, ApiError } from '@/lib/api'
import { IconStar } from '@/components/icons'
import { QuizPanel } from './QuizPanel'

interface Props {
  lesson: Lesson
  course: CourseDetail
  isDone: boolean
  saving: boolean
  completeError: string
  onComplete: () => void
}

const BASE_TABS = ['Sobre a aula', 'Transcrição', 'Materiais', 'Atividades'] as const

// PLACEHOLDER: sem endpoint — "você vai aprender" e bio do instrutor são estáticos/mock.
const APRENDIZADOS = [
  'Compreender os fundamentos abordados nesta aula',
  'Aplicar as estratégias na sua prática profissional',
  'Identificar boas práticas e evitar erros comuns',
]

export const LessonTabs = ({ lesson, course, isDone, saving, completeError, onComplete }: Props) => {
  const [tab, setTab] = useState<typeof BASE_TABS[number] | 'Comentários'>('Sobre a aula')
  const [comments, setComments] = useState<LessonComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [rating, setRating] = useState<LessonRating>({ value: 0, average: 0, count: 0 })
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingError, setRatingError] = useState('')

  useEffect(() => {
    let active = true
    setComments([])
    apiClient<LessonComment[]>(`/lessons/${lesson.id}/comments`)
      .then(res => { if (active) setComments(res) })
      .catch(() => { if (active) setComments([]) })
    return () => { active = false }
  }, [lesson.id])

  useEffect(() => {
    let active = true
    setRating({ value: 0, average: 0, count: 0 })
    apiClient<LessonRating>(`/lessons/${lesson.id}/rating`)
      .then(res => { if (active) setRating(res) })
      .catch(() => { if (active) setRating({ value: 0, average: 0, count: 0 }) })
    return () => { active = false }
  }, [lesson.id])

  const rate = async (value: number) => {
    setRatingError('')
    try {
      const res = await apiClient<LessonRating>(`/lessons/${lesson.id}/rating`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      })
      setRating(res)
    } catch (e) {
      setRatingError(e instanceof ApiError ? e.message : 'Não foi possível registrar a avaliação.')
    }
  }

  const sendComment = async () => {
    if (!newComment.trim()) return
    setSending(true); setCommentsError('')
    try {
      const comment = await apiClient<LessonComment>(`/lessons/${lesson.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment }),
      })
      setComments(prev => [comment, ...prev])
      setNewComment('')
    } catch (e) {
      setCommentsError(e instanceof ApiError ? e.message : 'Não foi possível enviar o comentário.')
    }
    setSending(false)
  }

  return (
    <div className="px-6 py-6 lg:px-8">
      <h2 className="font-display text-2xl font-extrabold text-brand-navy">{lesson.title}</h2>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-brand-navy/60">
        {lesson.durationSec != null && <span className="inline-flex items-center gap-1.5">⏱ {formatDuration(lesson.durationSec)} min</span>}
        <span className="inline-flex items-center gap-1.5">▷ Vídeo</span>
        {isDone ? (
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green/10 px-2.5 py-0.5 font-semibold text-brand-green-strong">✓ Concluída</span>
        ) : (
          <button
            onClick={onComplete}
            disabled={saving}
            className="rounded-pill bg-brand-amber px-3 py-1 font-semibold text-brand-navy transition hover:brightness-95 disabled:opacity-60"
          >
            {saving ? 'Salvando…' : 'Marcar como concluída'}
          </button>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 text-brand-navy/50">
          Avaliar aula
          <span className="inline-flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => rate(star)}
                onMouseEnter={() => setHoverRating(star)}
                aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                className={`transition-colors ${star <= (hoverRating || rating.value) ? 'text-brand-amber' : 'text-brand-navy/25'}`}
              >
                <IconStar className="h-3.5 w-3.5" />
              </button>
            ))}
          </span>
          {rating.count > 0 && <span>{rating.average.toFixed(1)} ({rating.count})</span>}
        </span>
      </div>
      {ratingError && <p role="alert" className="mt-2 text-xs text-brand-navy/80">{ratingError}</p>}
      {completeError && <p role="alert" className="mt-2 text-xs text-brand-navy/80">{completeError}</p>}

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-hairline text-sm">
        {[...BASE_TABS, 'Comentários' as const].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 font-medium transition-colors ${tab === t ? 'border-brand-blue text-brand-navy' : 'border-transparent text-brand-navy/55 hover:text-brand-navy'}`}
          >
            {t === 'Comentários' ? `Comentários (${comments.length})` : t}
          </button>
        ))}
      </div>

      <div className="py-6 text-sm leading-relaxed text-brand-navy/80">
        {tab === 'Sobre a aula' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              {lesson.content
                ? <p className="whitespace-pre-wrap">{lesson.content}</p>
                : <p className="text-brand-navy/60">Descrição desta aula em breve.</p>}
              <h3 className="mt-6 font-display text-sm font-bold text-brand-navy">Você vai aprender:</h3>
              <ul className="mt-3 space-y-2">
                {APRENDIZADOS.map(a => (
                  <li key={a} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-brand-blue text-[9px] font-bold text-white">✓</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
            <aside className="h-fit rounded-card border border-hairline bg-surface/40 p-5">
              <div className="flex items-center gap-3">
                <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-navy/10 font-display text-lg font-bold text-brand-navy">
                  {course.instructor.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-brand-navy">{course.instructor.name}</p>
                  <p className="text-xs text-brand-navy/55">Instrutor</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-brand-navy/70">
                Especialista responsável por este conteúdo na Full Time.
              </p>
            </aside>
          </div>
        )}

        {tab === 'Materiais' && (
          lesson.attachments.length ? (
            <ul className="space-y-2">
              {lesson.attachments.map(a => {
                const href = safeHref(a.url)
                return (
                  <li key={a.id}>
                    {href
                      ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-blue underline">{a.name}</a>
                      : <span className="text-brand-navy/50">{a.name}</span>}
                  </li>
                )
              })}
            </ul>
          ) : <p className="text-brand-navy/55">Nenhum material para esta aula.</p>
        )}

        {tab === 'Transcrição' && (
          lesson.transcript
            ? <p className="whitespace-pre-wrap">{lesson.transcript}</p>
            : <p className="text-brand-navy/50">Transcrição em breve.</p>
        )}
        {tab === 'Atividades' && <QuizPanel lessonId={lesson.id} />}

        {tab === 'Comentários' && (
          <div className="space-y-5">
            <div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Escreva um comentário…"
                className="h-24 w-full resize-none rounded-card border border-hairline bg-white p-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              {commentsError && <p role="alert" className="mt-2 text-xs text-brand-navy/80">{commentsError}</p>}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={sendComment}
                  disabled={sending || !newComment.trim()}
                  className="rounded-pill bg-brand-blue px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
                >
                  {sending ? 'Enviando…' : 'Comentar'}
                </button>
              </div>
            </div>

            {comments.length ? (
              <ul className="space-y-4">
                {comments.map(c => (
                  <li key={c.id} className="flex gap-3">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-navy/10 font-display text-sm font-bold text-brand-navy">
                      {c.author.name.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-sm font-bold text-brand-navy">{c.author.name}</span>
                        <span className="text-xs text-brand-navy/50">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-brand-navy/80">{c.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-brand-navy/55">Nenhum comentário ainda. Seja o primeiro a comentar.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
