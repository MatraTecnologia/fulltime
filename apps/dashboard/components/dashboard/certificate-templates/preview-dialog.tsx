"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import type { PageSize } from "@/services/certificate-templates"
import { PAGE_DIMENSIONS } from "./constants"

export const PreviewDialog = ({
  open,
  onOpenChange,
  html,
  loading,
  pageSize,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  html: string | null
  loading: boolean
  pageSize: PageSize
}) => {
  const page = PAGE_DIMENSIONS[pageSize]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Pré-visualização</DialogTitle>
          <DialogDescription>
            Renderização fiel ao PDF gerado com dados de exemplo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
          {loading || !html ? (
            <Spinner />
          ) : (
            <iframe
              title="Pré-visualização do certificado"
              srcDoc={html}
              className="w-full border-0 bg-white"
              style={{ aspectRatio: `${page.width} / ${page.height}` }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
