"use client"

import * as React from "react"
import { ClipboardCheck } from "lucide-react"
import { useGradingQueue } from "@/hooks/use-exam-grading"
import { getApiErrorMessage } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/dashboard/empty-state"
import { QueryError } from "@/components/dashboard/query-error"
import { GradingQueueSkeleton } from "@/components/dashboard/skeletons/grading-queue-skeleton"
import { GradingDialog } from "@/components/dashboard/exam-grading/grading-dialog"

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const formatDateTime = (iso: string) => dateFormatter.format(new Date(iso))

export const GradingConnected = () => {
  const [attemptId, setAttemptId] = React.useState<string | null>(null)
  const queue = useGradingQueue()

  if (queue.isPending) return <GradingQueueSkeleton />
  if (queue.isError) {
    return <QueryError message={getApiErrorMessage(queue.error)} onRetry={() => queue.refetch()} />
  }

  const data = queue.data

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="text-base">Fila de correção</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <EmptyState
              icon={ClipboardCheck}
              title="Nenhuma prova aguardando correção"
              description="Provas com questões dissertativas aparecem aqui após o envio do aluno."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Prova</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Enviado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.attemptId}>
                    <TableCell className="font-medium">{item.student}</TableCell>
                    <TableCell className="text-muted-foreground">{item.examTitle}</TableCell>
                    <TableCell className="max-w-[16rem] truncate text-muted-foreground">
                      {item.courseTitle}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(item.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setAttemptId(item.attemptId)}>
                        Corrigir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <GradingDialog attemptId={attemptId} onClose={() => setAttemptId(null)} />
    </div>
  )
}
