import { BookOpen, Clock, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import { apiServer, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { EnrollButton } from '@/components/enroll-button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const dynamic = 'force-dynamic'

const CatalogoDetalhePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  let course: CourseDetail
  try {
    course = await apiServer<CourseDetail>(`/courses/${slug}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <div>
      {course.coverImage && (
        <div className="mb-6 overflow-hidden rounded-2xl">
          <img
            src={course.coverImage}
            alt={course.title}
            className="aspect-video w-full object-cover"
          />
        </div>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className="bg-accent text-accent-foreground">
          {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
        </Badge>
      </div>

      <h1 className="font-display text-2xl font-bold text-brand-navy">{course.title}</h1>
      {course.description && (
        <p className="mt-2 text-sm leading-relaxed text-brand-navy/60">{course.description}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-brand-navy/60">
        <div className="flex items-center gap-1.5">
          <User className="size-4" />
          <span>{course.instructor.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="size-4" />
          <span>
            {course.modules.length} módulo{course.modules.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <span>
            {totalLessons} aula{totalLessons !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <EnrollButton courseId={course.id} slug={course.slug} />

      {course.modules.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold text-brand-navy">Currículo do curso</h2>
          <Accordion type="single" collapsible className="rounded-xl border border-border">
            {course.modules.map((m) => (
              <AccordionItem key={m.id} value={m.id}>
                <AccordionTrigger className="px-6 font-semibold">
                  {m.title}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 px-6 pb-2">
                    {m.lessons.map((l) => (
                      <li key={l.id} className="flex items-center gap-2.5 text-sm text-brand-navy/60">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-brand-navy">
                          {l.order}
                        </span>
                        {l.title}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}
    </div>
  )
}

export default CatalogoDetalhePage
