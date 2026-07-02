'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layers, Plus } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { PageHeader } from '../../_components/page-header'

const STATUS_LABELS = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado' } as const
const STATUS_BADGE = {
  DRAFT: 'bg-brand-amber/15 text-brand-amber-strong',
  PUBLISHED: 'bg-brand-green/12 text-brand-green-strong',
} as const

const CursosAdminPage = () => {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [deleting, setDeleting] = useState(false)

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

  const published = courses!.filter((c) => c.status === 'PUBLISHED').length
  const drafts = courses!.length - published

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Cursos"
        description={
          courses!.length > 0
            ? `${published} publicados · ${drafts} em rascunho`
            : 'Crie e gerencie os cursos da plataforma.'
        }
        actions={
          <Link href="/admin/cursos/novo">
            <Button size="sm" className="gap-1.5">
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

      {courses!.length === 0 ? (
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
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                Novo curso
              </Button>
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses!.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium text-brand-navy">{course.title}</TableCell>
                  <TableCell className="text-muted-foreground">{course.instructor.name}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_BADGE[course.status]}>
                      {STATUS_LABELS[course.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{course._count.modules}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/cursos/${course.slug}`}
                        className="text-sm font-medium text-brand-blue-strong hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={deleting}
                        className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default CursosAdminPage
