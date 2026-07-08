import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { CourseStatus } from "@/types"

const config: Record<CourseStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "Publicado", className: "bg-success/10 text-success border-success/20" },
  DRAFT: { label: "Rascunho", className: "bg-warning/10 text-warning border-warning/20" },
  ARCHIVED: { label: "Arquivado", className: "bg-muted text-muted-foreground border-border" },
}

export const CourseStatusBadge = ({ status }: { status: CourseStatus }) => {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      {label}
    </Badge>
  )
}
