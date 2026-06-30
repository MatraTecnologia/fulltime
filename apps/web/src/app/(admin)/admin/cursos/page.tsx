'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

const STATUS_LABELS = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado' } as const
const STATUS_BADGE_CLASSES = {
  DRAFT: 'border-amber-500 bg-amber-50 text-amber-700',
  PUBLISHED: 'border-green-500 bg-green-100 text-green-700',
} as const

const CursosAdminPage = () => {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch<CourseListItem[]>('/courses?status=DRAFT'),
      apiFetch<CourseListItem[]>('/courses?status=PUBLISHED'),
    ])
      .then(([draft, published]) => setCourses([...published, ...draft]))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          router.replace('/login')
        } else {
          setError(e instanceof ApiError ? e.message : 'Não foi possível carregar os cursos.')
        }
      })
  }, [router])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    setDeleteError('')
    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' })
      setCourses((prev) => prev?.filter((c) => c.id !== id) ?? null)
    } catch (e) {
      setDeleteError(e instanceof ApiError ? e.message : 'Não foi possível excluir o curso.')
    } finally {
      setDeleting(false)
    }
  }

  if (!courses && !error) {
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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Cursos</h1>
        <Link href="/admin/cursos/novo">
          <Button size="sm">Novo curso</Button>
        </Link>
      </div>

      {deleteError && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {deleteError}
        </p>
      )}

      {courses!.length === 0 ? (
        <Empty className="mt-8">
          <EmptyHeader>
            <EmptyTitle>Nenhum curso cadastrado</EmptyTitle>
            <EmptyDescription>Crie o primeiro curso da plataforma.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses!.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_BADGE_CLASSES[course.status]}>
                      {STATUS_LABELS[course.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{course._count.modules}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/cursos/${course.slug}`}
                        className="text-sm font-medium text-brand-blue hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={deleting}
                        className="text-sm text-destructive/60 hover:text-destructive disabled:opacity-50"
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
