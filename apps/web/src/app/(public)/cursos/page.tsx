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

const CatalogPage = async () => {
  const courses = await apiServer<CourseListItem[]>('/courses')

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Cursos</h1>
        <p className="mt-2 text-muted-foreground">
          Formação especializada para profissionais que atendem crianças atípicas
        </p>
      </div>
      {courses.length === 0 ? (
        <Empty className="mt-8 border border-border">
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
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </main>
  )
}

export default CatalogPage
