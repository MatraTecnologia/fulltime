"use client"

import * as React from "react"
import { AlignCenter, AlignLeft, AlignRight, ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getApiErrorMessage } from "@/lib/api"
import { uploadImage } from "@/services/uploads"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CertElement, CertElementStyle } from "@/services/certificate-templates"
import { BINDING_OPTIONS, FONT_FAMILIES, FONT_WEIGHTS, withStyle } from "./constants"

const NumberField = ({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
}) => (
  <div className="grid gap-1.5">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Input
      type="number"
      step={step}
      value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-8"
    />
  </div>
)

const ALIGN_OPTIONS: { value: CertElementStyle["align"]; icon: typeof AlignLeft }[] = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
]

export const ElementProperties = ({
  element,
  onChange,
  onStyleChange,
  onDelete,
}: {
  element: CertElement
  onChange: (patch: Partial<CertElement>) => void
  onStyleChange: (patch: Partial<CertElementStyle>) => void
  onDelete: () => void
}) => {
  const [uploading, setUploading] = React.useState(false)
  const style = withStyle(element)
  const isTextual = element.type === "text" || element.type === "dynamic"

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange({ src: url })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Propriedades</h3>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={onDelete} aria-label="Excluir elemento">
          <Trash2 className="size-4" />
        </Button>
      </div>

      {element.type === "dynamic" && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Campo dinâmico</Label>
          <Select
            value={element.binding ?? "studentName"}
            onValueChange={(value) => onChange({ binding: value as CertElement["binding"] })}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BINDING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {element.type === "text" && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Texto</Label>
          <Textarea
            rows={3}
            value={element.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Use {{studentName}} para inserir campos."
          />
        </div>
      )}

      {element.type === "image" && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Imagem</Label>
          <label
            className={cn(
              "flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30",
              uploading && "pointer-events-none opacity-70"
            )}
          >
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            {uploading ? (
              <Spinner />
            ) : element.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={element.src} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <>
                <ImagePlus className="size-6" />
                <span className="text-xs">Enviar imagem</span>
              </>
            )}
          </label>
        </div>
      )}

      {element.type === "qrcode" && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Dado do QR Code</Label>
          <Select
            value={element.binding ?? "verifyUrl"}
            onValueChange={(value) => onChange({ binding: value as CertElement["binding"] })}
          >
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BINDING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isTextual && (
        <div className="flex flex-col gap-4 border-t pt-4">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Fonte</Label>
            <Select value={style.fontFamily} onValueChange={(value) => onStyleChange({ fontFamily: value as string })}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Tamanho (pt)" value={style.fontSize} onChange={(v) => onStyleChange({ fontSize: v })} />
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Peso</Label>
              <Select
                value={String(style.fontWeight)}
                onValueChange={(value) => onStyleChange({ fontWeight: value as string })}
              >
                <SelectTrigger className="h-8 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((weight) => (
                    <SelectItem key={weight.value} value={weight.value}>
                      {weight.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Alinhamento</Label>
            <div className="flex gap-1">
              {ALIGN_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={style.align === option.value ? "secondary" : "outline"}
                  size="icon-sm"
                  onClick={() => onStyleChange({ align: option.value })}
                >
                  <option.icon className="size-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Alinhamento vertical</Label>
            <Select
              value={style.verticalAlign}
              onValueChange={(value) => onStyleChange({ verticalAlign: value as CertElementStyle["verticalAlign"] })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Topo</SelectItem>
                <SelectItem value="middle">Centro</SelectItem>
                <SelectItem value="bottom">Base</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Entrelinha"
              value={style.lineHeight}
              step={0.1}
              onChange={(v) => onStyleChange({ lineHeight: v })}
            />
            <NumberField
              label="Espaço (px)"
              value={style.letterSpacing}
              step={0.5}
              onChange={(v) => onStyleChange({ letterSpacing: v })}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="grid flex-1 gap-1.5">
              <Label className="text-xs text-muted-foreground">Cor</Label>
              <input
                type="color"
                value={style.color}
                onChange={(e) => onStyleChange({ color: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-md border border-input bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Switch
                checked={style.italic}
                onCheckedChange={(checked) => onStyleChange({ italic: checked })}
              />
              <Label className="text-xs text-muted-foreground">Itálico</Label>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 border-t pt-4">
        <NumberField label="X (mm)" value={element.x} onChange={(v) => onChange({ x: v })} />
        <NumberField label="Y (mm)" value={element.y} onChange={(v) => onChange({ y: v })} />
        <NumberField label="Largura (mm)" value={element.w} onChange={(v) => onChange({ w: v })} />
        <NumberField label="Altura (mm)" value={element.h} onChange={(v) => onChange({ h: v })} />
      </div>

      {isTextual && (
        <div className="grid gap-1.5">
          <Label className="text-xs text-muted-foreground">Opacidade</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={style.opacity}
            onChange={(e) => onStyleChange({ opacity: Number(e.target.value) })}
            className="h-8"
          />
        </div>
      )}
    </div>
  )
}
