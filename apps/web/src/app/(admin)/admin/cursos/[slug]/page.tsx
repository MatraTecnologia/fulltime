'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { Button, EmptyState, Spinner } from '@fulltime/ui'
import CourseForm from '@/components/course-form'

const CursoDetalhePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<CourseDetail>(`/courses/${slug}`)
      .then(setCourse)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setNotFound(true)
        } else if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar o curso.')
        }
      })
  }, [slug, router])

  const handleSaved = (updated: CourseDetail) => {
    setCourse(updated)
  }

  const handlePublish = async () => {
    if (!course) return
    setActionError(null)
    setPublishing(true)
    try {
      const updated = await apiFetch<CourseDetail>(`/courses/${course.id}/publish`, { method: 'POST' })
      setCourse(updated)
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível publicar o curso.')
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!course) return
    if (!window.confirm(`Excluir "${course.title}"? Esta ação não pode ser desfeita.`)) return
    try {
      await apiFetch(`/courses/${course.id}`, { method: 'DELETE' })
      router.push('/admin/cursos')
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível excluir o curso.')
    }
  }

  if (notFound) {
    return (
      <EmptyState
        title="Curso não encontrado"
        description="Este curso não existe ou foi removido."
        action={
          <Button variant="outline" onClick={() => router.push('/admin/cursos')}>
            Voltar
          </Button>
        }
      />
    )
  }

  if (!course && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-brand-navy">{course!.title}</h1>
        <div className="flex items-center gap-2">
          {course!.status === 'DRAFT' && (
            <Button size="sm" variant="accent" onClick={handlePublish} disabled={publishing}>
              {publishing ? 'Publicando...' : 'Publicar'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {actionError}
        </p>
      )}

      <CourseForm initial={course!} onSaved={handleSaved} />

      {/* editor de currículo: Task 10 */}
    </div>
  )
}

export default CursoDetalhePage
