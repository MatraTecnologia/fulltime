"use client"

import * as React from "react"
import { Award, BadgeCheck, Ban } from "lucide-react"
import { useIssuedCertificates } from "@/hooks/use-certificates"
import { getApiErrorMessage } from "@/lib/api"
import { formatNumber } from "@/lib/utils"
import { StatCard } from "@/components/dashboard/stat-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import { QueryError } from "@/components/dashboard/query-error"
import { CertificatesSkeleton } from "@/components/dashboard/skeletons/certificates-skeleton"
import { IssuedTable } from "@/components/dashboard/certificates/issued-table"
import { IssueDialog } from "@/components/dashboard/certificates/issue-dialog"
import { OverridesDialog } from "@/components/dashboard/certificates/overrides-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const CertificatesConnected = () => {
  const [adjustId, setAdjustId] = React.useState<string | null>(null)
  const certificates = useIssuedCertificates()

  if (certificates.isPending) return <CertificatesSkeleton />
  if (certificates.isError) {
    return (
      <QueryError
        message={getApiErrorMessage(certificates.error)}
        onRetry={() => certificates.refetch()}
      />
    )
  }

  const data = certificates.data
  const total = data.length
  const valid = data.filter((c) => c.status === "ISSUED").length
  const revoked = total - valid

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total emitidos" value={formatNumber(total)} icon={Award} />
        <StatCard label="Válidos" value={formatNumber(valid)} icon={BadgeCheck} />
        <StatCard label="Revogados" value={formatNumber(revoked)} icon={Ban} />
      </div>

      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">Certificados emitidos</CardTitle>
          <IssueDialog />
        </CardHeader>
        <CardContent className="p-0">
          {total === 0 ? (
            <EmptyState
              icon={Award}
              title="Nenhum certificado emitido"
              description="Emita certificados manualmente para alunos que concluíram seus cursos."
            />
          ) : (
            <IssuedTable certificates={data} onAdjust={setAdjustId} />
          )}
        </CardContent>
      </Card>

      <OverridesDialog certificateId={adjustId} onClose={() => setAdjustId(null)} />
    </div>
  )
}
