"use client"

import * as React from "react"
import { ImageIcon, ImagePlus, QrCode, Type, Variable, X } from "lucide-react"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ElementType, PageSize } from "@/services/certificate-templates"
import { PAGE_SIZE_LABELS } from "./constants"

const ADD_BUTTONS: { type: ElementType; label: string; icon: typeof Type }[] = [
  { type: "text", label: "Texto", icon: Type },
  { type: "dynamic", label: "Campo", icon: Variable },
  { type: "image", label: "Imagem", icon: ImageIcon },
  { type: "qrcode", label: "QR Code", icon: QrCode },
]

export const EditorToolbar = ({
  pageSize,
  onPageSizeChange,
  backgroundColor,
  onBackgroundColorChange,
  background,
  onBackgroundChange,
  onAddElement,
}: {
  pageSize: PageSize
  onPageSizeChange: (value: PageSize) => void
  backgroundColor: string | null
  onBackgroundColorChange: (value: string) => void
  background: string | null
  onBackgroundChange: (value: string | null) => void
  onAddElement: (type: ElementType) => void
}) => {
  const [uploading, setUploading] = React.useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onBackgroundChange(url)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5">
        {ADD_BUTTONS.map((button) => (
          <Button
            key={button.type}
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onAddElement(button.type)}
          >
            <button.icon className="size-4" />
            {button.label}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Página</Label>
        <Select value={pageSize} onValueChange={(value) => onPageSizeChange(value as PageSize)}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PAGE_SIZE_LABELS) as PageSize[]).map((size) => (
              <SelectItem key={size} value={size}>
                {PAGE_SIZE_LABELS[size]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Fundo</Label>
        <input
          type="color"
          value={backgroundColor ?? "#ffffff"}
          onChange={(e) => onBackgroundColorChange(e.target.value)}
          className="size-8 cursor-pointer rounded-md border border-input bg-transparent"
          aria-label="Cor de fundo"
        />
        <label className="inline-flex">
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            render={<span />}
            nativeButton={false}
          >
            {uploading ? <Spinner /> : <ImagePlus className="size-4" />}
            Imagem de fundo
          </Button>
        </label>
        {background && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            onClick={() => onBackgroundChange(null)}
            aria-label="Remover imagem de fundo"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
