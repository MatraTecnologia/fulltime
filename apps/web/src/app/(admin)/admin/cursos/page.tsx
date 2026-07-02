'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, Layers, Plus, Trash2, User } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { PageHeader } from '../../_components/page-header'

const STATUS_LABELS = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado' } as const
const STATUS_BADGE = {
  DRAFT: 'bg-brand-amber/15 text-brand-amber-strong',
  PUBLISHED: 'bg-brand-green/12 text-brand-green-strong',
} as const

type Filter = 'ALL' | 'PUBLISHED' | 'DRAFT'

const CourseAdminCard = ({
  course,
  deleting,
  onDelete,
}: {
  course: CourseListItem
  deleting: boolean
  onDelete: (id: string, title: string) => void
}) => (
  <div className="group relative flex flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06] transition-shadow hover:shadow-lifted">
    <Link href={`/admin/cursos/${course.slug}`} className="flex flex-1 flex-col">
      {course.coverImage ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-brand-navy-50">
          <BookOpen className="size-12 text-brand-navy/25" />
        </div>
      )}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-3">
        <Badge className={`w-fit ${STATUS_BADGE[course.status]}`}>{STATUS_LABELS[course.status]}</Badge>
        <h3 className="mt-2.5 line-clamp-2 font-display font-bold leading-snug text-brand-navy">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        )}
      </div>
    </Link>
    <div className="flex items-center justify-between gap-2 border-t border-brand-navy/[0.06] px-5 py-3">
      <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        <User className="size-3.5 shrink-0" />
        <span className="truncate">{course.instructor.name}</span>
      </div>
      <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
        <BookOpen className="size-3" />
        {course._count.modules} módulo{course._count.modules !== 1 ? 's' : ''}
      </Badge>
    </div>
    <button
      type="button"
      onClick={() => onDelete(course.id, course.title)}
      disabled={deleting}
      aria-label={`Excluir ${course.title}`}
      className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-md bg-white/90 text-muted-foreground opacity-0 shadow-sm ring-1 ring-brand-navy/[0.06] backdrop-blur transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  </div>
)

const CursosAdminPage = () => {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState<Filter>('ALL')

  useEffect(() => {
    Promise.all([
      apiFetch<CourseListItem[]>('/courses?status=PUBLISHED'),
      apiFetch<CourseListItem[]>('/courses?status=DRAFT'),
    ])
      .then(([published, draft]) => setCourses([...published, ...draft]))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) router.replace('/login')
        else setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os cursos.')
      })
  }, [router])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    setActionError('')
    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' })
      setCourses((prev) => prev?.filter((c) => c.id !== id) ?? null)
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Não foi possível excluir o curso.')
    } finally {
      setDeleting(false)
    }
  }

  const counts = useMemo(() => {
    const published = courses?.filter((c) => c.status === 'PUBLISHED').length ?? 0
    return { all: courses?.length ?? 0, published, draft: (courses?.length ?? 0) - published }
  }, [courses])

  const visible = useMemo(() => {
    if (!courses) return []
    if (filter === 'ALL') return courses
    return courses.filter((c) => c.status === filter)
  }, [courses, filter])

  if (!courses && !error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="size-8 text-primary" />
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
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Cursos"
        description={
          counts.all > 0
            ? `${counts.published} publicados · ${counts.draft} em rascunho`
            : 'Crie e gerencie os cursos da plataforma.'
        }
        actions={
          <Link href="/admin/cursos/novo">
            <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="size-4" />
              Novo curso
            </Button>
          </Link>
        }
      />

      {actionError && (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}

      {counts.all === 0 ? (
        <Empty className="rounded-card bg-white py-16 shadow-card ring-1 ring-brand-navy/[0.06]">
          <EmptyHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-navy-50 text-brand-navy">
              <Layers className="size-6" />
            </div>
            <EmptyTitle>Nenhum curso cadastrado</EmptyTitle>
            <EmptyDescription>Comece criando o primeiro curso da plataforma.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link href="/admin/cursos/novo">
              <Button size="sm" className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="size-4" />
                Novo curso
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="ALL">Todos ({counts.all})</TabsTrigger>
              <TabsTrigger value="PUBLISHED">Publicados ({counts.published})</TabsTrigger>
              <TabsTrigger value="DRAFT">Rascunhos ({counts.draft})</TabsTrigger>
            </TabsList>
          </Tabs>

          {visible.length === 0 ? (
            <div className="rounded-card bg-white py-14 text-center shadow-card ring-1 ring-brand-navy/[0.06]">
              <p className="text-sm text-muted-foreground">
                {filter === 'DRAFT' ? 'Nenhum curso em rascunho.' : 'Nenhum curso publicado.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((course) => (
                <CourseAdminCard
                  key={course.id}
                  course={course}
                  deleting={deleting}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CursosAdminPage
