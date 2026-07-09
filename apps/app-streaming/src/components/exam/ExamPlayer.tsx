import { useEffect, useMemo, useState } from 'react'
import type { ExamAnswerInput, ExamAttemptResult, ExamPlayer as ExamPlayerData } from '@/lib/types'
import { apiClient, ApiError } from '@/lib/api'

interface Props { examId: string; slug: string }

type AnswerState = Record<string, { selectedOptionIds?: string[]; essayText?: string }>

export const ExamPlayer = ({ examId, slug }: Props) => {
  const [exam, setExam] = useState<ExamPlayerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [answers, setAnswers] = useState<AnswerState>({})
  const [result, setResult] = useState<ExamAttemptResult | null>(null)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const load = () => {
    setLoading(true); setLoadError(''); setResult(null); setAnswers({})
    apiClient<ExamPlayerData>(`/exams/${examId}/player`)
      .then(res => setExam(res))
      .catch(e => setLoadError(e instanceof ApiError ? e.message : 'Não foi possível carregar a prova.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [examId])

  const answeredAll = useMemo(() => {
    if (!exam) return false
    return exam.questions.every(q => {
      const a = answers[q.id]
      if (!a) return false
      return q.type === 'ESSAY' ? !!a.essayText?.trim() : !!a.selectedOptionIds?.length
    })
  }, [exam, answers])

  const correctionByQuestion = useMemo(() => {
    const map: Record<string, NonNullable<ExamAttemptResult['corrections']>[number]> = {}
    result?.corrections?.forEach(c => { map[c.questionId] = c })
    return map
  }, [result])

  const selectSingle = (questionId: string, optionId: string) => {
    if (result) return
    setAnswers(prev => ({ ...prev, [questionId]: { selectedOptionIds: [optionId] } }))
  }

  const toggleMultiple = (questionId: string, optionId: string) => {
    if (result) return
    setAnswers(prev => {
      const current = prev[questionId]?.selectedOptionIds ?? []
      const next = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId]
      return { ...prev, [questionId]: { selectedOptionIds: next } }
    })
  }

  const setEssay = (questionId: string, essayText: string) => {
    if (result) return
    setAnswers(prev => ({ ...prev, [questionId]: { essayText } }))
  }

  const submit = async () => {
    if (!exam) return
    setSending(true); setSubmitError('')
    try {
      const payload: ExamAnswerInput[] = exam.questions.map(q => ({
        questionId: q.id,
        selectedOptionIds: answers[q.id]?.selectedOptionIds,
        essayText: answers[q.id]?.essayText,
      }))
      const res = await apiClient<ExamAttemptResult>(`/exams/${examId}/attempts`, {
        method: 'POST',
        body: JSON.stringify({ answers: payload }),
      })
      setResult(res)
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : 'Não foi possível enviar a prova.')
    }
    setSending(false)
  }

  if (loading) return <p className="text-brand-navy/55">Carregando prova…</p>
  if (loadError) return <p role="alert" className="text-brand-navy/80">{loadError}</p>
  if (!exam) return null

  const attemptsUsedDisplay = result ? exam.attemptsUsed + 1 : exam.attemptsUsed
  const attemptsLabel = `${attemptsUsedDisplay}/${exam.maxAttempts ?? '∞'} tentativas`

  if (!result && exam.passed) {
    return (
      <div className="space-y-4">
        <div className="rounded-card border border-hairline bg-brand-green/10 px-4 py-3 text-sm font-semibold text-brand-green-strong">
          Você já foi aprovado nesta prova.
        </div>
        <a href={`/aprender/${slug}`} className="text-sm font-medium text-brand-blue underline">Voltar para o curso</a>
      </div>
    )
  }

  if (!result && !exam.canAttempt) {
    return (
      <div className="space-y-4">
        <div className="rounded-card border border-hairline bg-surface/40 px-4 py-3 text-sm font-semibold text-brand-navy">
          Você atingiu o limite de tentativas desta prova ({attemptsLabel}).
        </div>
        <a href={`/aprender/${slug}`} className="text-sm font-medium text-brand-blue underline">Voltar para o curso</a>
      </div>
    )
  }

  const retryAvailable = result && !result.needsGrading && result.passed === false
    && (exam.maxAttempts == null || exam.attemptsUsed + 1 < exam.maxAttempts)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-bold text-brand-navy">{exam.title}</h1>
          {exam.description && <p className="mt-1 text-sm text-brand-navy/70">{exam.description}</p>}
        </div>
        <span className="text-xs text-brand-navy/50">{attemptsLabel} · nota mínima {exam.passingScore}%</span>
      </div>

      {result && (
        <div className={`rounded-card border px-4 py-3 text-sm font-semibold ${
          result.needsGrading
            ? 'border-hairline bg-surface/40 text-brand-navy'
            : result.passed
              ? 'border-brand-green/40 bg-brand-green/10 text-brand-green-strong'
              : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {result.needsGrading
            ? 'Prova enviada. Aguardando correção do instrutor.'
            : `Você ${result.passed ? 'foi aprovado' : 'não atingiu a nota mínima'}: ${result.score}/${result.totalPoints} pontos`}
        </div>
      )}

      <ol className="space-y-6">
        {exam.questions.map((q, qi) => {
          const correction = correctionByQuestion[q.id]
          const selected = answers[q.id]?.selectedOptionIds ?? []
          return (
            <li key={q.id}>
              <p className="font-medium text-brand-navy">
                {qi + 1}. {q.prompt} <span className="text-xs font-normal text-brand-navy/50">({q.points} pt{q.points > 1 ? 's' : ''})</span>
              </p>

              {q.type === 'ESSAY' ? (
                <textarea
                  value={answers[q.id]?.essayText ?? ''}
                  onChange={e => setEssay(q.id, e.target.value)}
                  disabled={!!result}
                  placeholder="Escreva sua resposta…"
                  className="mt-3 h-32 w-full resize-none rounded-card border border-hairline bg-white p-3 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:opacity-70"
                />
              ) : (
                <div className="mt-3 space-y-2">
                  {q.options.map(o => {
                    const checked = selected.includes(o.id)
                    let state = ''
                    if (correction) {
                      if (correction.correctOptionIds.includes(o.id)) {
                        state = 'border-brand-green bg-brand-green/10 text-brand-green-strong'
                      } else if (checked) {
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
                          type={q.type === 'MULTIPLE' ? 'checkbox' : 'radio'}
                          name={q.id}
                          value={o.id}
                          checked={checked}
                          onChange={() => q.type === 'MULTIPLE' ? toggleMultiple(q.id, o.id) : selectSingle(q.id, o.id)}
                          disabled={!!result}
                          className="accent-brand-blue"
                        />
                        <span>{o.text}</span>
                      </label>
                    )
                  })}
                </div>
              )}
              {correction && (
                <p className="mt-1.5 text-xs text-brand-navy/50">{correction.earned}/{q.points} pt{q.points > 1 ? 's' : ''}</p>
              )}
            </li>
          )
        })}
      </ol>

      {submitError && <p role="alert" className="text-xs text-brand-navy/80">{submitError}</p>}

      <div className="flex items-center gap-3">
        {result ? (
          retryAvailable ? (
            <button
              onClick={load}
              className="rounded-pill bg-brand-blue px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-blue/90"
            >
              Tentar novamente
            </button>
          ) : (
            <a href={`/aprender/${slug}`} className="text-sm font-medium text-brand-blue underline">Voltar para o curso</a>
          )
        ) : (
          <>
            <button
              onClick={submit}
              disabled={sending || !answeredAll}
              className="rounded-pill bg-brand-blue px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-blue/90 disabled:opacity-60"
            >
              {sending ? 'Enviando…' : 'Enviar prova'}
            </button>
            {!answeredAll && <span className="text-xs text-brand-navy/50">Responda todas as questões para enviar.</span>}
          </>
        )}
      </div>
    </div>
  )
}
