import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const CardSkeleton = ({ className }: { className?: string }) => (
  <Card className={className}>
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-40 w-full" />
  </Card>
)

export const OverviewSkeleton = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 md:gap-6">
      <Card className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="flex flex-1 items-start gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3 w-40" />
              <div className="flex gap-8 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Skeleton className="h-40 w-full lg:max-w-sm" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-28" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
          <CardSkeleton />
          <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
