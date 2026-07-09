"use client"

import * as React from "react"
import { Download, RotateCcw, Settings2, Ban } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useReissueCertificate, useRevokeCertificate } from "@/hooks/use-certificates"
import { certificatePdfUrl, formatCertificateDate } from "@/services/certificates"
import type { IssuedCertificate } from "@/services/certificates"

const RevokeButton = ({ id }: { id: string }) => {
  const [open, setOpen] = React.useState(false)
  const revoke = useRevokeCertificate()

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive">
            <Ban className="size-4" />
            Revogar
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revogar certificado</AlertDialogTitle>
          <AlertDialogDescription>
            O aluno perde a validade deste certificado. Você pode reemitir depois.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={revoke.isPending}
            onClick={() => revoke.mutate(id, { onSuccess: () => setOpen(false) })}
          >
            {revoke.isPending && <Spinner />}
            Revogar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const ReissueButton = ({ id }: { id: string }) => {
  const reissue = useReissueCertificate()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5"
      disabled={reissue.isPending}
      onClick={() => reissue.mutate(id)}
    >
      {reissue.isPending ? <Spinner /> : <RotateCcw className="size-4" />}
      Reemitir
    </Button>
  )
}

export const IssuedTable = ({
  certificates,
  onAdjust,
}: {
  certificates: IssuedCertificate[]
  onAdjust: (id: string) => void
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Aluno</TableHead>
          <TableHead>Curso</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Emissão</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {certificates.map((cert) => (
          <TableRow key={cert.id}>
            <TableCell className="font-medium">{cert.student.name}</TableCell>
            <TableCell className="max-w-[16rem] truncate text-muted-foreground">
              {cert.course.title}
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">{cert.code}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatCertificateDate(cert.issuedAt)}
            </TableCell>
            <TableCell>
              {cert.status === "ISSUED" ? (
                <Badge
                  variant="outline"
                  className="border-transparent bg-success/10 font-medium text-success"
                >
                  Válido
                </Badge>
              ) : (
                <Badge variant="destructive">Revogado</Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  nativeButton={false}
                  render={
                    <a href={certificatePdfUrl(cert.code)} target="_blank" rel="noreferrer" />
                  }
                >
                  <Download className="size-4" />
                  PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onAdjust(cert.id)}
                >
                  <Settings2 className="size-4" />
                  Ajustar
                </Button>
                {cert.status === "ISSUED" ? (
                  <RevokeButton id={cert.id} />
                ) : (
                  <ReissueButton id={cert.id} />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
