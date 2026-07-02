import Link from 'next/link'
import { BookOpen, CheckCircle2 } from 'lucide-react'
import type { EnrollmentListItem } from '@/lib/types'
import { Progress } from '@/components/ui/progress'

export const CourseProgressCard = ({ enrollment }: { enrollment: EnrollmentListItem }) => {
  const pct = enrollment.totalLessons
    ? Math.round((enrollment.progressCount / enrollment.totalLessons) * 100)
    : 0
  const done =
    enrollment.status === 'COMPLETED' ||
    (enrollment.totalLessons > 0 && enrollment.progressCount === enrollment.totalLessons)

  return (
    <Link
      href={`/aprender/${enrollment.course.slug}`}
      className="group block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-card bg-white shadow-card ring-1 ring-brand-navy/[0.06] transition-shadow group-hover:shadow-lifted">
        {enrollment.course.coverImage ? (
          <img
            src={enrollment.course.coverImage}
            alt={enrollment.course.title}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-brand-navy-50">
            <BookOpen className="size-9 text-brand-navy/25" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-brand-navy">
              {enrollment.course.title}
            </h3>
            {done && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-brand-green/15 px-2 py-0.5 text-[11px] font-semibold text-brand-green-strong">
                <CheckCircle2 className="size-3" />
                Concluído
              </span>
            )}
          </div>
          <div className="mt-auto space-y-2">
            <Progress value={pct} className="h-1.5" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {enrollment.progressCount} / {enrollment.totalLessons} aulas
              </span>
              <span className="font-semibold text-brand-navy">{pct}%</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
