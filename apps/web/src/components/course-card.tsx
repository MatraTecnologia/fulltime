import { Card, CardContent, CardTitle } from '@fulltime/ui'
import type { CourseListItem } from '@/lib/types'

export const CourseCard = ({ course }: { course: CourseListItem }) => (
  <a href={`/cursos/${course.slug}`} className="block transition hover:-translate-y-0.5">
    <Card>
      <CardContent>
        <CardTitle>{course.title}</CardTitle>
        <p className="mt-2 line-clamp-2 text-sm text-brand-navy/70">{course.description}</p>
        <p className="mt-3 text-xs text-brand-navy/50">{course._count.modules} módulos · {course.instructor.name}</p>
      </CardContent>
    </Card>
  </a>
)
