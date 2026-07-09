import { useEffect, useMemo, useState } from 'react'
import type { Quiz, QuizSubmitResult } from '@/lib/types'
import { apiClient, ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'

interface Props {
  lessonId: string
}

export const QuizPanel = ({ lessonId }: Props) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<QuizSubmitResult | null>(null)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let active = true
    setQuiz(null); setLoading(true); setEmpty(false); setLoadError('')
    setAnswers({}); setResult(null); setSubmitError('')
    apiClient<Quiz>(`/lessons/${lessonId}/quiz`)
      .then(res => { if (active) setQuiz(res) })
      .catch(e => {
        if (!active) return
        if (e instanceof ApiError && e.status === 404) setEmpty(true)
        else setLoadError(e instanceof ApiError ? e.message : 'Não foi possível carregar as atividades.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [lessonId])

  const answeredAll = useMemo(
    () => !!quiz && quiz.questions.every(q => answers[q.id]),
    [quiz, answers],
  )

  const correctionByQuestion = useMemo(() => {
    const map: Record<string, QuizSubmitResult['corrections'][number]> = {}
    result?.corrections.forEach(c => { map[c.questionId] = c })
    return map
  }, [result])

  const select = (questionId: string, optionId: string) => {
    if (result) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const submit = async () => {
    if (!quiz) return
    setSending(true); setSubmitError('')
    try {
      const res = await apiClient<QuizSubmitResult>(`/lessons/${lessonId}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      })
      setResult(res)
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Não foi possível enviar as respostas.')
    }
    setSending(false)
  }

  const reset = () => {
    setResult(null); setAnswers({}); setSubmitError('')
  }

  if (loading) return <p className="text-brand-navy/55">Carregando atividades…</p>
  if (empty) return <p className="text-brand-navy/50">Esta aula ainda não tem atividades.</p>
  if (loadError) return <p role="alert" className="text-brand-navy/80">{loadError}</p>
  if (!quiz) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-lg font-bold text-brand-navy">{quiz.title}</h3>
        {quiz.lastAttempt && (
          <span className="text-xs text-brand-navy/50">
            Última tentativa: {quiz.lastAttempt.score}/{quiz.lastAttempt.total} · {formatDate(quiz.lastAttempt.createdAt)}
          </span>
        )}
      </div>

      {result && (
        <div className="rounded-card border border-hairline bg-surface/40 px-4 py-3 text-sm font-semibold text-brand-navy">
          Você acertou {result.score} de {result.total}
        </div>
      )}

      <ol className="space-y-6">
        {quiz.questions.map((q, qi) => {
          const correction = correctionByQuestion[q.id]
          return (
            <li key={q.id}>
              <p className="font-medium text-brand-navy">
                {qi + 1}. {q.statement}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map(o => {
                  const checked = answers[q.id] === o.id
                  let state = ''
                  if (correction) {
                    if (o.id === correction.correctOptionId) {
                      state = 'border-brand-green bg-brand-green/10 text-brand-green-strong'
                    } else if (o.id === correction.chosenOptionId) {
                      state = 'border-red-400 bg-red-50 text-red-700'
                    } else {
                      state = 'border-hairline text-brand-navy/70'
                    }
                  } else {
                    state = checked
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-navy'
                      : 'border-hairline text-brand-navy/80 hover:border-brand-blue/40'
                  }
                  return (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-card border px-4 py-2.5 text-sm transition-colors ${state} ${result ? 'cursor-default' : ''}`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={o.id}
                        checked={checked}
                        onChange={() => select(q.id, o.id)}
                        disabled={!!result}
                        className="accent-brand-blue"
                      />
                      <span>{o.text}</span>
                    </label>
                  )
                })}
              </div>
            </li>
          )
        })}
      </ol>

      {submitError && <p role="alert" className="text-xs text-brand-navy/80">{submitError}</p>}

      <div className="flex items-center gap-3">
        {result ? (
          <button
            onClick={reset}
            className="rounded-pill bg-brand-blue px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-blue/90"
          >
            Refazer
          </button>
        ) : (
          <>
            <button
              onClick={submit}
              disabled={sending || !answeredAll}
              className="rounded-pill bg-brand-blue px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {sending ? 'Enviando…' : 'Enviar respostas'}
            </button>
            {!answeredAll && <span className="text-xs text-brand-navy/50">Responda todas as perguntas para enviar.</span>}
          </>
        )}
      </div>
    </div>
  )
}
