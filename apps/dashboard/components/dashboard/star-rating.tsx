import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export const StarRating = ({ value, className, size = 14 }: { value: number; className?: string; size?: number }) => {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i < Math.round(value) ? "fill-brand-gold text-brand-gold" : "fill-muted text-muted"
          )}
        />
      ))}
    </span>
  )
}
