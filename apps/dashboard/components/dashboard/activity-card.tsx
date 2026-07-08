import { Award, MessageSquare, Star, UserPlus, type LucideIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { ActivityItem } from "@/types"

const iconByType: Record<ActivityItem["type"], LucideIcon> = {
  comment: MessageSquare,
  enrollment: UserPlus,
  rating: Star,
  certificate: Award,
}

export const ActivityCard = ({ items }: { items: ActivityItem[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atividades recentes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {items.map((item) => {
          const Icon = iconByType[item.type]
          return (
            <div key={item.id} className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{item.timeAgo}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
