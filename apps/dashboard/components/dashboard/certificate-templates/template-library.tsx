"use client"

import Link from "next/link"
import { Award, Copy, FileText, Plus, Trash2 } from "lucide-react"
import { getApiErrorMessage } from "@/lib/api"
import {
  useCloneTemplate,
  useCreateTemplate,
  useDeleteTemplate,
  useTemplates,
} from "@/hooks/use-certificate-templates"
import { PAGE_SIZE_LABELS } from "@/components/dashboard/certificate-templates/constants"
import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { QueryError } from "@/components/dashboard/query-error"
import { ConfirmDelete } from "@/components/dashboard/course-detail/confirm-delete"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import type { CertificateTemplate } from "@/services/certificate-templates"

const TemplateCard = ({ template }: { template: CertificateTemplate }) => {
  const clone = useCloneTemplate()
  const remove = useDeleteTemplate()

  return (
    <Card className="group relative gap-0 overflow-hidden p-0">
      <Link
        href={`/certificados/templates/${template.id}`}
        className="flex aspect-[297/210] items-center justify-center border-b bg-muted/40 transition-colors group-hover:bg-muted/60"
        style={{
          backgroundColor: template.backgroundColor ?? undefined,
          backgroundImage: template.background ? `url(${template.background})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!template.background && !template.backgroundColor && (
          <Award className="size-10 text-muted-foreground/50" />
        )}
      </Link>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{template.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{PAGE_SIZE_LABELS[template.pageSize]}</p>
          </div>
          {template.isDefault && (
            <Badge variant="outline" className="border-transparent bg-primary/10 text-xs font-medium text-primary">
              Padrão
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="size-3.5" />
            {template.coursesCount ?? 0} cursos
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              aria-label="Duplicar modelo"
              onClick={() => clone.mutate(template.id)}
              disabled={clone.isPending}
            >
              {clone.isPending ? <Spinner /> : <Copy className="size-4" />}
            </Button>
            <ConfirmDelete
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground"
                  aria-label="Excluir modelo"
                >
                  <Trash2 className="size-4" />
                </Button>
              }
              title="Excluir modelo"
              description="Esta ação não pode ser desfeita. Cursos usando este modelo voltarão ao padrão."
              loading={remove.isPending}
              onConfirm={() => remove.mutate(template.id)}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

const LibrarySkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-64 w-full rounded-xl" />
    ))}
  </div>
)

export const TemplateLibrary = () => {
  const { data, isPending, isError, error, refetch } = useTemplates()
  const create = useCreateTemplate()

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Modelos de certificado"
        description="Crie e personalize os modelos usados nos certificados dos seus cursos."
      >
        <Button
          className="gap-1.5"
          onClick={() => create.mutate({ name: "Novo modelo" })}
          disabled={create.isPending}
        >
          {create.isPending ? <Spinner /> : <Plus className="size-4" />}
          Novo modelo
        </Button>
      </PageHeader>

      {isPending ? (
        <LibrarySkeleton />
      ) : isError ? (
        <QueryError message={getApiErrorMessage(error)} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhum modelo ainda"
          description="Crie seu primeiro modelo de certificado para personalizar o que seus alunos recebem."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}
