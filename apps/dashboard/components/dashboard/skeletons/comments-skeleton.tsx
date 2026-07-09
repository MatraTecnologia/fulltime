import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const CommentsSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-64 rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="gap-0 p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="mt-2 h-12 w-full" />
              <Skeleton className="mt-2 h-8 w-28" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
