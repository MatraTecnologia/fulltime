import Link from 'next/link'
import { BookOpen, User } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CourseListItem } from '@/lib/types'

export const CourseCard = ({ course, basePath = '/cursos' }: { course: CourseListItem; basePath?: string }) => (
  <Link href={`${basePath}/${course.slug}`} className="group block h-full">
    <Card className="h-full gap-0 overflow-hidden border-border/50 py-0 shadow-sm transition-shadow group-hover:shadow-md">
      {course.coverImage ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted">
          <BookOpen className="size-12 text-muted-foreground/40" />
        </div>
      )}
      <CardContent className="flex-1 px-5 pt-4 pb-3">
        <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/50 px-5 py-3">
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{course.instructor.name}</span>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
            <BookOpen className="size-3" />
            {course._count.modules} módulo{course._count.modules !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  </Link>
)
