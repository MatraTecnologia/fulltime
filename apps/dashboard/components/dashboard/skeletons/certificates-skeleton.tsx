import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const CertificatesSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Card className="gap-0 p-5">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-8 w-32" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
