"use client"

import * as React from "react"
import { GraduationCap, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/dashboard/empty-state"
import { useEligibleEnrollments, useIssueCertificate } from "@/hooks/use-certificates"
import { getApiErrorMessage } from "@/lib/api"

export const IssueDialog = () => {
  const [open, setOpen] = React.useState(false)
  const eligible = useEligibleEnrollments()
  const issue = useIssueCertificate()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Emitir certificado
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Emitir certificado</DialogTitle>
          <DialogDescription>
            Alunos que concluíram o curso e ainda não têm certificado.
          </DialogDescription>
        </DialogHeader>

        {eligible.isPending ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : eligible.isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {getApiErrorMessage(eligible.error)}
          </p>
        ) : eligible.data.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Nenhum aluno elegível"
            description="Assim que um aluno concluir um curso, ele aparecerá aqui para emissão."
          />
        ) : (
          <ul className="-mx-2 max-h-[24rem] divide-y overflow-y-auto">
            {eligible.data.map((item) => (
              <li key={item.enrollmentId} className="flex items-center gap-3 px-2 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.student.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.course.title}</p>
                </div>
                <Button
                  size="sm"
                  disabled={issue.isPending}
                  onClick={() => issue.mutate(item.enrollmentId)}
                >
                  {issue.isPending && issue.variables === item.enrollmentId && <Spinner />}
                  Emitir
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
