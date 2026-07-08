import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const CoursesTableSkeleton = ({ rows = 6 }: { rows?: number }) => {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between border-b p-4">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="size-11 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="hidden h-4 w-10 sm:block" />
            <Skeleton className="hidden h-4 w-12 md:block" />
            <Skeleton className="h-1.5 w-32 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-40 rounded-md" />
      </div>
    </Card>
  )
}
