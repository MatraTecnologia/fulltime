import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CourseCard } from '@/components/course-card'
import type { CourseListItem } from '@/lib/types'

export const LandingFeaturedCourses = ({ courses }: { courses: CourseListItem[] }) => {
  if (courses.length === 0) return null

  return (
    <section className="bg-primary px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl">
              Cursos em destaque
            </h2>
            <p className="mt-2 text-primary-foreground/70">
              Os mais procurados pelos profissionais da área
            </p>
          </div>
          <Button asChild variant="inverse">
            <Link href="/cursos">Ver todos os cursos</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </section>
  )
}
