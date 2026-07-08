import { CalendarDays, MoreHorizontal, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ClassGroup, ClassStatus } from "@/types"

const statusConfig: Record<ClassStatus, { label: string; className: string }> = {
  active: { label: "Ativa", className: "bg-success/10 text-success border-success/20" },
  upcoming: { label: "Próxima", className: "bg-primary/10 text-primary border-primary/20" },
  finished: { label: "Concluída", className: "bg-muted text-muted-foreground border-border" },
}

export const ClassCard = ({ group }: { group: ClassGroup }) => {
  const status = statusConfig[group.status]

  return (
    <Card className="gap-0 p-5">
      <div className="flex items-start justify-between gap-2">
        <Badge variant="outline" className={cn("font-medium", status.className)}>
          {status.label}
        </Badge>
        <Button variant="ghost" size="icon" className="-mr-1.5 -mt-1.5 size-8" aria-label="Ações">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>

      <h3 className="mt-3 font-medium leading-tight">{group.name}</h3>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{group.courseTitle}</p>

      <CardContent className="mt-4 flex flex-col gap-3 p-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {group.students}/{group.capacity} alunos
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {group.periodLabel}
          </span>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso da turma</span>
            <span className="font-medium tabular-nums">{group.progress}%</span>
          </div>
          <Progress value={group.progress} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  )
}
