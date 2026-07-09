"use client"

import Link from "next/link"
import { BookOpen, ChevronRight, Clock, Eye, Rocket } from "lucide-react"
import { getApiErrorMessage } from "@/lib/api"
import { useCourseDetail, usePublishCourse } from "@/hooks/use-course-detail"
import { formatDurationSec } from "@/services/courses-detail"
import { CourseStatusBadge } from "@/components/dashboard/course-status-badge"
import { CourseDetailTabs } from "@/components/dashboard/course-detail/course-detail-tabs"
import { CourseDetailSkeleton } from "@/components/dashboard/skeletons/course-detail-skeleton"
import { QueryError } from "@/components/dashboard/query-error"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export const CourseDetailConnected = ({ slug }: { slug: string }) => {
  const { data: course, isPending, isError, error, refetch } = useCourseDetail(slug)
  const publishCourse = usePublishCourse(slug)

  if (isPending) return <CourseDetailSkeleton />
  if (isError) return <QueryError message={getApiErrorMessage(error)} onRetry={() => refetch()} />

  const lessonsCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalSeconds = course.modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0),
    0
  )
  const durationLabel = formatDurationSec(totalSeconds)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/cursos" className="transition-colors hover:text-foreground">
          Meus cursos
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate text-foreground">{course.title}</span>
      </nav>

      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{course.title}</h1>
              <CourseStatusBadge status={course.status} />
            </div>
            {course.description && (
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{course.description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" />
                {lessonsCount} aulas
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {durationLabel}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" className="gap-1.5">
              <Eye className="size-4" />
              Visualizar
            </Button>
            {course.status === "PUBLISHED" ? (
              <Button className="gap-1.5" disabled>
                <Rocket className="size-4" />
                Publicado
              </Button>
            ) : (
              <Button
                className="gap-1.5"
                onClick={() => publishCourse.mutate(course.id)}
                disabled={publishCourse.isPending}
              >
                {publishCourse.isPending ? <Spinner /> : <Rocket className="size-4" />}
                Publicar curso
              </Button>
            )}
          </div>
        </div>
      </Card>

      <CourseDetailTabs course={course} />
    </div>
  )
}
