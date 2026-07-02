import Link from 'next/link'
import { BookOpen, ChevronRight, PlayCircle } from 'lucide-react'
import type { EnrollmentListItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const ContinueLearning = ({ enrollment }: { enrollment: EnrollmentListItem }) => {
  const pct = enrollment.totalLessons
    ? Math.round((enrollment.progressCount / enrollment.totalLessons) * 100)
    : 0

  return (
    <section aria-labelledby="continue-title" className="space-y-4">
      <h2
        id="continue-title"
        className="font-display text-lg font-bold tracking-tight text-brand-navy"
      >
        Continue de onde parou
      </h2>
      <div className="overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06]">
        <div className="flex flex-col sm:flex-row">
          {enrollment.course.coverImage ? (
            <img
              src={enrollment.course.coverImage}
              alt={enrollment.course.title}
              className="h-44 w-full shrink-0 object-cover sm:h-auto sm:w-72"
            />
          ) : (
            <div className="flex h-44 w-full shrink-0 items-center justify-center bg-brand-navy-50 sm:h-auto sm:w-72">
              <BookOpen className="size-12 text-brand-navy/20" />
            </div>
          )}
          <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-amber/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-amber-strong">
                <PlayCircle className="size-3" />
                Em andamento
              </span>
              <h3 className="font-display text-xl font-extrabold leading-tight tracking-tight text-brand-navy">
                {enrollment.course.title}
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progresso</span>
                  <span className="font-semibold text-brand-navy">
                    {enrollment.progressCount} / {enrollment.totalLessons} aulas
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            </div>
            <Button
              asChild
              className="w-fit bg-brand-amber font-semibold text-brand-navy hover:bg-brand-amber/90"
            >
              <Link href={`/aprender/${enrollment.course.slug}`}>
                Continuar aula
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
