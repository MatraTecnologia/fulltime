'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail, EnrollmentDetail, EnrollmentListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { CurriculumNav } from '@/components/curriculum-nav'
import { LessonPlayer } from '@/components/lesson-player'

const AprenderPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null)
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const [course, enrollments] = await Promise.all([
          apiFetch<CourseDetail>(`/courses/${slug}`),
          apiFetch<EnrollmentListItem[]>('/enrollments'),
        ])
        if (!active) return
        setCourseDetail(course)

        const found = enrollments.find(e => e.course.slug === slug)
        if (!found) {
          setEnrollmentId(null)
          setLoading(false)
          return
        }

        const detail = await apiFetch<EnrollmentDetail>(`/enrollments/${found.id}`)
        if (!active) return

        setCompletedLessonIds(new Set(detail.progress.map(p => p.lessonId)))
        setEnrollmentId(found.id)
        setActiveId(prev => prev ?? course.modules[0]?.lessons[0]?.id ?? null)
        setLoading(false)
      } catch (e) {
        if (!active) return
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar o curso.')
          setLoading(false)
        }
      }
    }

    load()
    return () => { active = false }
  }, [slug, version, router])

  const handleEnroll = async () => {
    if (!courseDetail) return
    setEnrolling(true)
    setEnrollError(null)
    try {
      await apiFetch(`/courses/${courseDetail.id}/enroll`, { method: 'POST' })
      setVersion(v => v + 1)
    } catch (e) {
      setEnrollError(e instanceof ApiError ? e.message : 'Não foi possível realizar a matrícula.')
    } finally {
      setEnrolling(false)
    }
  }

  const handleCompleted = useCallback((lessonId: string) => {
    setCompletedLessonIds(prev => new Set(prev).add(lessonId))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-600" role="alert">{error}</p>
      </div>
    )
  }

  if (!enrollmentId) {
    return (
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyTitle>Você não está matriculado neste curso</EmptyTitle>
          {courseDetail?.title && <EmptyDescription>{courseDetail.title}</EmptyDescription>}
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-col items-center gap-2">
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Matriculando…' : 'Matricular-se gratuitamente'}
            </Button>
            {enrollError && <p className="text-sm text-red-600" role="alert">{enrollError}</p>}
          </div>
        </EmptyContent>
      </Empty>
    )
  }

  if (!courseDetail || !activeId) {
    return (
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyTitle>Este curso não tem aulas ainda</EmptyTitle>
          <EmptyDescription>Volte em breve.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-brand-navy">{courseDetail.title}</h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <LessonPlayer
            lessonId={activeId}
            enrollmentId={enrollmentId}
            completed={completedLessonIds.has(activeId)}
            onCompleted={handleCompleted}
          />
        </div>
        <aside className="lg:w-72 lg:shrink-0">
          <CurriculumNav
            modules={courseDetail.modules}
            completedLessonIds={completedLessonIds}
            activeId={activeId}
            onSelect={setActiveId}
          />
        </aside>
      </div>
    </div>
  )
}

export default AprenderPage
