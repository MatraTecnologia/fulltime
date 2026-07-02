'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Check, Clock, PlayCircle, User } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import CourseForm from './course-form'
import CurriculumEditor from './curriculum-editor'

const STEPS = [
  { n: 1, label: 'Dados básicos' },
  { n: 2, label: 'Currículo' },
  { n: 3, label: 'Revisão' },
] as const

const Stepper = ({
  current,
  maxReached,
  onSelect,
}: {
  current: number
  maxReached: number
  onSelect: (n: number) => void
}) => (
  <ol className="flex items-center">
    {STEPS.map((step, idx) => {
      const done = step.n < current
      const active = step.n === current
      const reachable = step.n <= maxReached
      return (
        <li key={step.n} className="flex flex-1 items-center last:flex-none">
          <button
            type="button"
            onClick={() => reachable && onSelect(step.n)}
            disabled={!reachable}
            className="flex items-center gap-2.5 text-left disabled:cursor-default"
            aria-current={active ? 'step' : undefined}
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 transition-colors',
                active && 'bg-accent text-accent-foreground ring-transparent',
                done && 'bg-brand-navy text-white ring-transparent',
                !active && !done && 'bg-white text-brand-navy/40 ring-brand-navy/15',
              )}
            >
              {done ? <Check className="size-4" /> : step.n}
            </span>
            <span
              className={cn(
                'hidden text-sm font-semibold sm:inline',
                active ? 'text-brand-navy' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </button>
          {idx < STEPS.length - 1 && (
            <span
              className={cn(
                'mx-3 h-px flex-1 transition-colors',
                step.n < current ? 'bg-brand-navy' : 'bg-brand-navy/15',
              )}
            />
          )}
        </li>
      )
    })}
  </ol>
)

const ReviewRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-3">
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-navy-50 text-brand-navy/60">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold text-brand-navy">{value}</p>
    </div>
  </div>
)

const CourseWizard = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [maxReached, setMaxReached] = useState(1)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [navigating, setNavigating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const refreshCourse = async () => {
    if (!course) return
    const fresh = await apiFetch<CourseDetail>(`/courses/${course.slug}`)
    setCourse(fresh)
  }

  const goTo = async (target: number) => {
    if (target >= 2 && !course) return
    if (target === 3) {
      setNavigating(true)
      try {
        await refreshCourse()
      } finally {
        setNavigating(false)
      }
    }
    setStep(target)
    setMaxReached((m) => Math.max(m, target))
  }

  const handleSaved = (c: CourseDetail) => {
    setCourse(c)
    setStep(2)
    setMaxReached((m) => Math.max(m, 2))
  }

  const handlePublish = async () => {
    if (!course) return
    setPublishError(null)
    setPublishing(true)
    try {
      await apiFetch(`/courses/${course.id}/publish`, { method: 'POST' })
      router.push(`/admin/cursos/${course.slug}`)
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.message : 'Não foi possível publicar o curso.')
      setPublishing(false)
    }
  }

  const totalLessons = course?.modules.reduce((acc, m) => acc + m.lessons.length, 0) ?? 0

  return (
    <div className="space-y-8">
      <Stepper current={step} maxReached={maxReached} onSelect={goTo} />

      {step === 1 && (
        <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-brand-navy/[0.06]">
          <CourseForm initial={course ?? undefined} onSaved={handleSaved} />
        </div>
      )}

      {step === 2 && course && (
        <div className="space-y-6">
          <div className="rounded-card bg-white px-6 pt-2 pb-6 shadow-card ring-1 ring-brand-navy/[0.06]">
            <CurriculumEditor course={course} onChange={refreshCourse} />
          </div>
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => goTo(1)}>
              Voltar
            </Button>
            <Button type="button" onClick={() => goTo(3)} disabled={navigating}>
              {navigating ? 'Carregando...' : 'Avançar'}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && course && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]">
            {course.coverImage ? (
              <img src={course.coverImage} alt={course.title} className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-brand-navy-50">
                <PlayCircle className="size-12 text-brand-navy/20" />
              </div>
            )}
            <div className="p-6">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-brand-navy">
                {course.title}
              </h2>
              {course.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{course.description}</p>
              )}
              <div className="mt-4 divide-y divide-brand-navy/[0.06]">
                <ReviewRow icon={<User className="size-4" />} label="Instrutor" value={course.instructor.name} />
                <ReviewRow
                  icon={<BookOpen className="size-4" />}
                  label="Módulos"
                  value={`${course.modules.length} módulo${course.modules.length !== 1 ? 's' : ''}`}
                />
                <ReviewRow
                  icon={<Clock className="size-4" />}
                  label="Aulas"
                  value={`${totalLessons} aula${totalLessons !== 1 ? 's' : ''}`}
                />
              </div>
              {totalLessons === 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Este curso ainda não tem aulas. Adicione ao menos uma aula antes de publicar.
                </p>
              )}
            </div>
          </div>

          {publishError && (
            <p className="text-sm text-destructive" role="alert">
              {publishError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => goTo(2)} disabled={publishing}>
              Voltar
            </Button>
            <Button
              type="button"
              onClick={handlePublish}
              disabled={publishing || totalLessons === 0}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {publishing && <Spinner className="size-4" />}
              {publishing ? 'Publicando...' : 'Publicar curso'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseWizard
