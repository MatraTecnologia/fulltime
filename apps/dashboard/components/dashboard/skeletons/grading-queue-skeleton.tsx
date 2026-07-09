import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const GradingQueueSkeleton = () => {
  return (
    <Card className="gap-0 p-5">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
        ))}
      </div>
    </Card>
  )
}
