'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import CourseWizard from '@/components/course-wizard'

const STATUS_LABELS = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado' } as const
const STATUS_BADGE = {
  DRAFT: 'bg-brand-amber/15 text-brand-amber-strong',
  PUBLISHED: 'bg-brand-green/12 text-brand-green-strong',
} as const

const CursoDetalhePage = () => {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [deleting, setDeleting] = useState(false)
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

  const handleDelete = async () => {
    if (!course) return
    if (!window.confirm(`Excluir "${course.title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await apiFetch(`/courses/${course.id}`, { method: 'DELETE' })
      router.push('/admin/cursos')
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível excluir o curso.')
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
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/cursos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-navy"
      >
        <ArrowLeft className="size-4" />
        Cursos
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
            {course!.title}
          </h1>
          <Badge className={STATUS_BADGE[course!.status]}>{STATUS_LABELS[course!.status]}</Badge>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {course!.status === 'PUBLISHED' && (
            <Button size="sm" variant="outline" asChild>
              <Link href={`/catalogo/${course!.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Visualizar
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-muted-foreground hover:border-destructive/40 hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="size-4" />
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}

      <CourseWizard initialCourse={course!} />
    </div>
  )
}

export default CursoDetalhePage
