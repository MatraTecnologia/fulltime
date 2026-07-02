import { BookOpen } from 'lucide-react'
import { apiServer } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { CourseCard } from '@/components/course-card'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { PageHeader } from '../_components/page-header'

export const dynamic = 'force-dynamic'

const CatalogoPage = async () => {
  const courses = await apiServer<CourseListItem[]>('/courses')

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Explorar cursos"
        description="Formação especializada para profissionais que atendem crianças atípicas."
      />
      {courses.length === 0 ? (
        <Empty className="rounded-card border-none bg-white shadow-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>Nenhum curso disponível ainda</EmptyTitle>
            <EmptyDescription>Em breve novos conteúdos serão publicados.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} basePath="/catalogo" />
          ))}
        </div>
      )}
    </div>
  )
}

export default CatalogoPage
