import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "@/components/dashboard/star-rating"
import type { RatingBucket } from "@/types"

export const RatingsDistribution = ({
  average,
  total,
  buckets,
}: {
  average: number
  total: number
  buckets: RatingBucket[]
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Avaliações dos alunos</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-5">
        <div className="flex flex-col items-center justify-center">
          <p className="text-3xl font-bold tracking-tight">{average.toFixed(1)}</p>
          <StarRating value={average} />
          <p className="mt-1 text-xs text-muted-foreground">{total} avaliações</p>
        </div>
        <ul className="flex-1 space-y-1.5">
          {buckets.map((bucket) => (
            <li key={bucket.stars} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{bucket.stars}</span>
              <Progress value={bucket.percentage} className="h-1.5 flex-1" />
              <span className="w-8 text-right text-muted-foreground">{bucket.percentage}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
