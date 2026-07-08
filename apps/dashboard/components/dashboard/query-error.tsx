import { AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const QueryError = ({
  message = "Não foi possível carregar os dados.",
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) => {
  return (
    <Card className="items-center gap-3 p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </Card>
  )
}
