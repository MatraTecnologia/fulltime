'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import CourseForm from '@/components/course-form'
import CurriculumEditor from '@/components/curriculum-editor'

const CursoDetalhePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const reload = async () => {
    const data = await apiFetch<CourseDetail>(`/courses/${slug}`)
    setCourse(data)
  }

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

  const handleSaved = async (updated: CourseDetail) => {
    if (updated.slug !== slug) {
      router.replace(`/admin/cursos/${updated.slug}`)
      return
    }
    await reload()
  }

  const handlePublish = async () => {
    if (!course) return
    setActionError(null)
    setPublishing(true)
    try {
      await apiFetch(`/courses/${course.id}/publish`, { method: 'POST' })
      await reload()
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível publicar o curso.')
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!course) return
    if (!window.confirm(`Excluir "${course.title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await apiFetch(`/courses/${course.id}`, { method: 'DELETE' })
      router.push('/admin/cursos')
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível excluir o curso.')
    } finally {
      setDeleting(false)
    }
  }

  if (notFound) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Curso não encontrado</EmptyTitle>
          <EmptyDescription>Este curso não existe ou foi removido.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push('/admin/cursos')}>
            Voltar
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!course && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-destructive" role="alert">
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
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? 'Publicando...' : 'Publicar'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}

      <CourseForm initial={course!} onSaved={handleSaved} />

      <CurriculumEditor course={course!} onChange={reload} />
    </div>
  )
}

export default CursoDetalhePage
