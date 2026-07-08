import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "@/components/dashboard/star-rating"
import { formatNumber } from "@/lib/utils"
import type { CourseSummary } from "@/types"

export const CoursesListCard = ({ courses }: { courses: CourseSummary[] }) => {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Meus cursos</CardTitle>
        <Link href="/cursos" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Ver todos <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="divide-y">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <BookOpen className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{course.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <StarRating value={course.rating} size={12} />
                <span>{course.rating > 0 ? course.rating.toFixed(1) : "—"}</span>
                <span aria-hidden>·</span>
                <span>{formatNumber(course.students)} alunos</span>
              </div>
            </div>
            <div className="hidden w-32 shrink-0 sm:block">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Conclusão</span>
                <span className="font-medium">{course.completionRate}%</span>
              </div>
              <Progress value={course.completionRate} className="h-1.5" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
