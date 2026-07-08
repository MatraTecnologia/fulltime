import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

export const Logo = ({ className, collapsed = false }: { className?: string; collapsed?: boolean }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="size-5" />
      </div>
      {!collapsed && (
        <span className="text-lg font-bold tracking-tight text-brand-navy">
          Full<span className="text-primary">Time</span>
        </span>
      )}
    </div>
  )
}
