import { apiServer } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { CourseCard } from '@/components/course-card'
import { EmptyState } from '@fulltime/ui'

export const dynamic = 'force-dynamic'

const CatalogPage = async () => {
  const courses = await apiServer<CourseListItem[]>('/courses')
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">Cursos</h1>
      {courses.length === 0 ? (
        <EmptyState title="Nenhum curso disponível ainda" />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </main>
  )
}

export default CatalogPage
