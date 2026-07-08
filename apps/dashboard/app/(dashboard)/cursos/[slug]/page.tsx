import Link from "next/link"
import { BookOpen, ChevronRight, Clock, Eye, Rocket, Users } from "lucide-react"
import { getCourseDetail } from "@/lib/mock/course-detail"
import { CourseStatusBadge } from "@/components/dashboard/course-status-badge"
import { StarRating } from "@/components/dashboard/star-rating"
import { CourseDetailTabs } from "@/components/dashboard/course-detail/course-detail-tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/utils"

const CoursePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  const course = getCourseDetail(slug)

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
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{course.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="size-4" />
                {formatNumber(course.students)} alunos
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" />
                {course.lessonsCount} aulas
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {course.durationLabel}
              </span>
              {course.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <StarRating value={course.rating} size={14} />
                  {course.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" className="gap-1.5">
              <Eye className="size-4" />
              Visualizar
            </Button>
            <Button className="gap-1.5">
              <Rocket className="size-4" />
              {course.status === "PUBLISHED" ? "Publicado" : "Publicar curso"}
            </Button>
          </div>
        </div>
      </Card>

      <CourseDetailTabs course={course} />
    </div>
  )
}

export default CoursePage
