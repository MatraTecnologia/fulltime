"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Eye, MousePointerClick, Save } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { getApiErrorMessage } from "@/lib/api"
import { useTemplate, useUpdateTemplate } from "@/hooks/use-certificate-templates"
import { previewTemplate } from "@/services/certificate-templates"
import type {
  CertElement,
  CertElementStyle,
  CertificateTemplate,
  ElementType,
  PageSize,
} from "@/services/certificate-templates"
import { QueryError } from "@/components/dashboard/query-error"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { EditorToolbar } from "./editor-toolbar"
import { EditorCanvas } from "./editor-canvas"
import { ElementProperties } from "./element-properties"
import { PreviewDialog } from "./preview-dialog"
import { PAGE_DIMENSIONS, createElement, withStyle } from "./constants"

const MAX_SCALE = 4

const EditorWorkspace = ({ template }: { template: CertificateTemplate }) => {
  const [name, setName] = React.useState(template.name)
  const [pageSize, setPageSize] = React.useState<PageSize>(template.pageSize)
  const [background, setBackground] = React.useState<string | null>(template.background)
  const [backgroundColor, setBackgroundColor] = React.useState<string | null>(
    template.backgroundColor ?? "#ffffff"
  )
  const [elements, setElements] = React.useState<CertElement[]>(template.elements)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewHtml, setPreviewHtml] = React.useState<string | null>(null)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(900)

  React.useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setContainerWidth(width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const update = useUpdateTemplate(template.id)
  const preview = useMutation({
    mutationFn: previewTemplate,
    onSuccess: ({ html }) => {
      setPreviewHtml(html)
      setPreviewOpen(true)
    },
    onError: (error) => setPreviewHtml(`<p style="padding:16px">${getApiErrorMessage(error)}</p>`),
  })

  const page = PAGE_DIMENSIONS[pageSize]
  const scale = Math.min(containerWidth / page.width, MAX_SCALE)
  const selected = elements.find((el) => el.id === selectedId) ?? null

  const updateElement = (id: string, patch: Partial<CertElement>) =>
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)))

  const updateStyle = (id: string, patch: Partial<CertElementStyle>) =>
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, style: { ...withStyle(el), ...patch } } : el))
    )

  const addElement = (type: ElementType) => {
    const element = { ...createElement(type, page), z: elements.length }
    setElements((prev) => [...prev, element])
    setSelectedId(element.id)
  }

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id))
    setSelectedId(null)
  }

  const handleSave = () =>
    update.mutate({ name: name.trim() || "Modelo sem nome", pageSize, background, backgroundColor, elements })

  const handlePreview = () => {
    setPreviewHtml(null)
    setPreviewOpen(true)
    preview.mutate({ pageSize, background, backgroundColor, elements })
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/certificados" className="transition-colors hover:text-foreground">
              Certificados
            </Link>
            <ChevronRight className="size-4" />
            <Link href="/certificados/templates" className="transition-colors hover:text-foreground">
              Modelos
            </Link>
            <ChevronRight className="size-4" />
            <span className="truncate text-foreground">{name || "Sem nome"}</span>
          </nav>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-9 max-w-sm text-base font-semibold"
            placeholder="Nome do modelo"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" className="gap-1.5" onClick={handlePreview} disabled={preview.isPending}>
            {preview.isPending ? <Spinner /> : <Eye className="size-4" />}
            Pré-visualizar
          </Button>
          <Button className="gap-1.5" onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? <Spinner /> : <Save className="size-4" />}
            Salvar
          </Button>
        </div>
      </div>

      <EditorToolbar
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={setBackgroundColor}
        background={background}
        onBackgroundChange={setBackground}
        onAddElement={addElement}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div ref={containerRef} className="flex justify-center overflow-auto rounded-xl border bg-muted/30 p-6">
          <EditorCanvas
            elements={elements}
            pageSize={pageSize}
            background={background}
            backgroundColor={backgroundColor}
            scale={scale}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={updateElement}
          />
        </div>

        <Card className="h-fit p-4 lg:sticky lg:top-20">
          {selected ? (
            <ElementProperties
              element={selected}
              onChange={(patch) => updateElement(selected.id, patch)}
              onStyleChange={(patch) => updateStyle(selected.id, patch)}
              onDelete={() => deleteElement(selected.id)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <MousePointerClick className="size-6" />
              <p>Selecione um elemento para editar suas propriedades.</p>
            </div>
          )}
        </Card>
      </div>

      <PreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        html={previewHtml}
        loading={preview.isPending}
        pageSize={pageSize}
      />
    </div>
  )
}

const EditorSkeleton = () => (
  <div className="mx-auto flex max-w-7xl flex-col gap-6">
    <Skeleton className="h-9 w-64" />
    <Skeleton className="h-14 w-full rounded-xl" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <Skeleton className="h-[420px] w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  </div>
)

export const TemplateEditor = ({ id }: { id: string }) => {
  const { data: template, isPending, isError, error, refetch } = useTemplate(id)

  if (isPending) return <EditorSkeleton />
  if (isError) return <QueryError message={getApiErrorMessage(error)} onRetry={() => refetch()} />

  return <EditorWorkspace key={template.id} template={template} />
}
