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

export const dynamic = 'force-dynamic'

const CatalogoPage = async () => {
  const courses = await apiServer<CourseListItem[]>('/courses')

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Explorar cursos</h1>
        <p className="mt-1 text-sm text-brand-navy/60">
          Formação especializada para profissionais que atendem crianças atípicas
        </p>
      </div>
      {courses.length === 0 ? (
        <Empty className="mt-4 border border-border">
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
