"use client"

import * as React from "react"
import { ClipboardList, FileText, Pencil, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDelete } from "@/components/dashboard/course-detail/confirm-delete"
import { ExamEditorSheet, type ExamEditorTarget } from "@/components/dashboard/course-detail/exam-editor-sheet"
import { EmptyState } from "@/components/dashboard/empty-state"
import { QueryError } from "@/components/dashboard/query-error"
import { useCourseExams, useDeleteExam } from "@/hooks/use-exams"
import { getApiErrorMessage } from "@/lib/api"
import type { CourseModuleNode } from "@/services/courses-detail"
import type { ExamStatus } from "@/services/exams"

const statusConfig: Record<ExamStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "Publicada", className: "bg-success/10 text-success border-success/20" },
  DRAFT: { label: "Rascunho", className: "bg-warning/10 text-warning border-warning/20" },
}

export const ExamsTab = ({
  courseId,
  modules,
}: {
  courseId: string
  slug: string
  modules: CourseModuleNode[]
}) => {
  const exams = useCourseExams(courseId)
  const deleteExam = useDeleteExam(courseId)
  const [editorTarget, setEditorTarget] = React.useState<ExamEditorTarget | null>(null)

  if (exams.isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (exams.isError) {
    return <QueryError message={getApiErrorMessage(exams.error)} onRetry={() => exams.refetch()} />
  }

  const data = exams.data
  const availableModules = modules.filter((m) => !data.some((e) => e.moduleId === m.id))
  const hasFinalExam = data.some((e) => e.moduleId === null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Provas</h2>
          <p className="text-sm text-muted-foreground">
            Crie provas de módulo ou uma prova final para avaliar os alunos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="gap-1.5" disabled={availableModules.length === 0}>
                  <Plus className="size-4" />
                  Nova prova do módulo
                </Button>
              }
            />
            <DropdownMenuContent>
              {availableModules.map((m) => (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => setEditorTarget({ kind: "new", moduleId: m.id, moduleTitle: m.title })}
                >
                  {m.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="gap-1.5"
            disabled={hasFinalExam}
            onClick={() => setEditorTarget({ kind: "new", moduleId: null, moduleTitle: null })}
          >
            <Plus className="size-4" />
            Nova prova final
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma prova ainda"
          description="Crie provas de módulo ou uma prova final para avaliar os alunos."
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <ul className="divide-y">
            {data.map((exam) => (
              <li key={exam.id} className="flex items-center gap-3 p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{exam.title}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {exam.module ? exam.module.title : "Prova final"}
                    </Badge>
                    <Badge variant="outline" className={statusConfig[exam.status].className}>
                      {statusConfig[exam.status].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{exam._count.questions} questões</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground"
                  aria-label="Editar prova"
                  onClick={() => setEditorTarget({ kind: "edit", examId: exam.id })}
                >
                  <Pencil className="size-4" />
                </Button>
                <ConfirmDelete
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground"
                      aria-label="Excluir prova"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  }
                  title="Excluir prova"
                  description={`Tem certeza que deseja excluir "${exam.title}"? Essa ação não pode ser desfeita.`}
                  onConfirm={() => deleteExam.mutate(exam.id)}
                  loading={deleteExam.isPending}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {editorTarget && (
        <ExamEditorSheet
          courseId={courseId}
          target={editorTarget}
          open={!!editorTarget}
          onOpenChange={(open) => !open && setEditorTarget(null)}
        />
      )}
    </div>
  )
}
