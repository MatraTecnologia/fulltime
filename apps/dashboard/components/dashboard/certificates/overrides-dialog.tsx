"use client"

import * as React from "react"
import { ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useCertificateDetail, useSaveOverrides } from "@/hooks/use-certificates"
import {
  certificatePdfUrl,
  formatCertificateDate,
  type CertificateDetail,
} from "@/services/certificates"

type OverrideField = { key: string; label: string }

const OVERRIDE_FIELDS: OverrideField[] = [
  { key: "studentName", label: "Nome do aluno" },
  { key: "courseTitle", label: "Título do curso" },
  { key: "issueDate", label: "Data de emissão" },
  { key: "code", label: "Código de verificação" },
  { key: "instructorName", label: "Nome do instrutor" },
  { key: "courseDurationHours", label: "Carga horária (horas)" },
  { key: "verifyUrl", label: "URL de verificação" },
]

const defaultPlaceholder = (detail: CertificateDetail, key: string) => {
  switch (key) {
    case "studentName":
      return detail.student.name
    case "courseTitle":
      return detail.course.title
    case "code":
      return detail.code
    case "issueDate":
      return formatCertificateDate(detail.issuedAt)
    default:
      return "Padrão do modelo"
  }
}

const OverridesForm = ({
  detail,
  onDone,
}: {
  detail: CertificateDetail
  onDone: () => void
}) => {
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(OVERRIDE_FIELDS.map((f) => [f.key, (detail.overrides ?? {})[f.key] ?? ""]))
  )
  const save = useSaveOverrides()

  const handleSave = () => {
    const overrides = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v.trim() !== "")
    )
    save.mutate({ id: detail.id, overrides }, { onSuccess: onDone })
  }

  return (
    <>
      <div className="flex max-h-[24rem] flex-col gap-4 overflow-y-auto pr-1">
        {OVERRIDE_FIELDS.map((field) => (
          <div key={field.key} className="grid gap-2">
            <Label htmlFor={`ov-${field.key}`}>{field.label}</Label>
            <Input
              id={`ov-${field.key}`}
              value={values[field.key]}
              placeholder={defaultPlaceholder(detail, field.key)}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>
      <DialogFooter className="sm:justify-between">
        <Button
          variant="outline"
          nativeButton={false}
          className="gap-1.5"
          render={
            <a href={certificatePdfUrl(detail.code)} target="_blank" rel="noreferrer" />
          }
        >
          <ExternalLink className="size-4" />
          Ver PDF
        </Button>
        <div className="flex gap-2">
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={handleSave} disabled={save.isPending}>
            {save.isPending && <Spinner />}
            Salvar
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}

export const OverridesDialog = ({
  certificateId,
  onClose,
}: {
  certificateId: string | null
  onClose: () => void
}) => {
  const open = certificateId !== null
  const detail = useCertificateDetail(certificateId ?? "", open)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar certificado</DialogTitle>
          <DialogDescription>
            Sobrescreva campos específicos deste aluno. Deixe em branco para usar o padrão do modelo.
          </DialogDescription>
        </DialogHeader>

        {detail.isPending ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : detail.isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Não foi possível carregar os dados do certificado.
          </p>
        ) : (
          <OverridesForm key={detail.data.id} detail={detail.data} onDone={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
