import { ArrowUpRight, Award } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatNumber } from "@/lib/utils"

export const CertificatesCard = ({
  total,
  deltaMonth,
  deltaPercentage,
}: {
  total: number
  deltaMonth: number
  deltaPercentage: number
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Certificados emitidos</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-gold/15 text-brand-gold">
          <Award className="size-7" />
        </span>
        <div>
          <p className="text-3xl font-bold tracking-tight">{formatNumber(total)}</p>
          <p className="text-xs text-muted-foreground">Total de certificados</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-success">
            <ArrowUpRight className="size-3.5" />+{formatNumber(deltaMonth)}
            <span className="font-normal text-muted-foreground">
              ({deltaPercentage}% vs. mês anterior)
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
