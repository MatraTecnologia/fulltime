'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import {
  Button,
  CategoryBadge,
  EmptyState,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@fulltime/ui'

const STATUS_LABELS = { DRAFT: 'Rascunho', PUBLISHED: 'Publicado' } as const
const STATUS_COLORS = { DRAFT: 'amber', PUBLISHED: 'green' } as const

const CursosAdminPage = () => {
  const router = useRouter()
  const [courses, setCourses] = useState<CourseListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    try {
      await apiFetch(`/courses/${id}`, { method: 'DELETE' })
      setCourses((prev) => prev?.filter((c) => c.id !== id) ?? null)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível excluir o curso.')
    }
  }

  if (!courses && !error) {
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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Cursos</h1>
        <Link href="/admin/cursos/novo">
          <Button size="sm">Novo curso</Button>
        </Link>
      </div>

      {courses!.length === 0 ? (
        <EmptyState
          title="Nenhum curso cadastrado"
          description="Crie o primeiro curso da plataforma."
          className="mt-8"
        />
      ) : (
        <div className="mt-6">
          <Table>
            <Thead>
              <Tr>
                <Th>Título</Th>
                <Th>Status</Th>
                <Th>Módulos</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {courses!.map((course) => (
                <Tr key={course.id}>
                  <Td className="font-medium">{course.title}</Td>
                  <Td>
                    <CategoryBadge color={STATUS_COLORS[course.status]}>
                      {STATUS_LABELS[course.status]}
                    </CategoryBadge>
                  </Td>
                  <Td>{course._count.modules}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/cursos/${course.slug}`}
                        className="text-sm font-medium text-brand-blue hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        className="text-sm text-red-400 hover:text-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default CursosAdminPage
