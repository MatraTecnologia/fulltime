import { Award, BookOpen, Clock, FileText, PlayCircle, User, Video } from 'lucide-react'
import { notFound } from 'next/navigation'
import { apiServer, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { EnrollButton } from '@/components/enroll-button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const dynamic = 'force-dynamic'

const formatTotalDuration = (sec: number) => {
  const h = Math.floor(sec / 3600)
  const min = Math.round((sec % 3600) / 60)
  if (h > 0) return min > 0 ? `${h}h ${min}min` : `${h}h`
  return `${min}min`
}

const formatLessonDuration = (sec: number) => {
  const min = Math.floor(sec / 60)
  const s = sec % 60
  return `${min}:${String(s).padStart(2, '0')}`
}

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
  const totalDurationSec = course.modules.reduce(
    (acc, m) => acc + m.lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0),
    0,
  )

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-green/15 px-2.5 py-0.5 text-xs font-semibold text-brand-green-strong">
              {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
            </span>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
              {course.title}
            </h1>
            {course.description && (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            )}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4 text-brand-navy/40" />
                {course.instructor.name}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4 text-brand-navy/40" />
                {course.modules.length} módulo{course.modules.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5">
                <PlayCircle className="size-4 text-brand-navy/40" />
                {totalLessons} aula{totalLessons !== 1 ? 's' : ''}
              </span>
              {totalDurationSec > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-brand-navy/40" />
                  {formatTotalDuration(totalDurationSec)}
                </span>
              )}
            </div>
          </div>

          {course.modules.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-lg font-bold tracking-tight text-brand-navy">
                Currículo do curso
              </h2>
              <Accordion
                type="single"
                collapsible
                className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]"
              >
                {course.modules.map((m) => (
                  <AccordionItem key={m.id} value={m.id} className="border-hairline px-2">
                    <AccordionTrigger className="px-4 font-display font-bold text-brand-navy hover:no-underline">
                      <span className="flex flex-1 items-center justify-between gap-3">
                        <span>{m.title}</span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {m.lessons.length} aula{m.lessons.length !== 1 ? 's' : ''}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2.5 px-4 pb-2">
                        {m.lessons.map((l) => (
                          <li
                            key={l.id}
                            className="flex items-center gap-3 text-sm text-brand-navy/70"
                          >
                            <PlayCircle className="size-4 shrink-0 text-brand-navy/30" />
                            <span className="min-w-0 flex-1 truncate">{l.title}</span>
                            {l.durationSec != null && (
                              <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
                                {formatLessonDuration(l.durationSec)}
                              </span>
                            )}
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

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]">
            {course.coverImage ? (
              <img
                src={course.coverImage}
                alt={course.title}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-brand-navy-50">
                <PlayCircle className="size-12 text-brand-navy/20" />
              </div>
            )}
            <div className="p-5">
              <p className="font-display text-sm font-bold text-brand-navy">
                Acesso completo ao curso
              </p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Video className="size-4 shrink-0 text-brand-navy/40" />
                  Aulas em vídeo sob demanda
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="size-4 shrink-0 text-brand-navy/40" />
                  Materiais de apoio
                </li>
                <li className="flex items-center gap-2">
                  <Award className="size-4 shrink-0 text-brand-navy/40" />
                  Certificado de conclusão
                </li>
              </ul>
              <EnrollButton courseId={course.id} slug={course.slug} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default CatalogoDetalhePage
