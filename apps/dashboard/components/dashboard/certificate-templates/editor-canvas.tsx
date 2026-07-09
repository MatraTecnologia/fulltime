"use client"

import * as React from "react"
import { QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CertElement, PageSize } from "@/services/certificate-templates"
import {
  BINDING_LABELS,
  PAGE_DIMENSIONS,
  PT_TO_MM,
  resolveBindingText,
  withStyle,
} from "./constants"

type Corner = "nw" | "ne" | "sw" | "se"

interface DragState {
  mode: "move" | "resize"
  corner?: Corner
  pointerId: number
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startW: number
  startH: number
}

const MIN_SIZE = 5

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const ElementContent = ({ element, scale }: { element: CertElement; scale: number }) => {
  const style = withStyle(element)
  const justify =
    style.verticalAlign === "top" ? "flex-start" : style.verticalAlign === "bottom" ? "flex-end" : "center"

  if (element.type === "image") {
    if (!element.src) {
      return (
        <div className="flex size-full items-center justify-center rounded-sm border border-dashed border-muted-foreground/40 bg-muted/40 text-[0.65rem] text-muted-foreground">
          Imagem
        </div>
      )
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={element.src} alt="" className="size-full object-contain" draggable={false} />
    )
  }

  if (element.type === "qrcode") {
    return (
      <div className="flex size-full items-center justify-center rounded-sm bg-white text-foreground">
        <QrCode className="size-3/4" />
      </div>
    )
  }

  const text =
    element.type === "dynamic"
      ? (element.binding && BINDING_LABELS[element.binding]) || "«Campo»"
      : resolveBindingText(element.text ?? "")

  return (
    <div
      className="flex size-full overflow-hidden"
      style={{
        justifyContent:
          style.align === "left" ? "flex-start" : style.align === "right" ? "flex-end" : "center",
        alignItems: justify,
        textAlign: style.align,
        fontFamily: `'${style.fontFamily}'`,
        fontSize: style.fontSize * PT_TO_MM * scale,
        fontWeight: style.fontWeight,
        fontStyle: style.italic ? "italic" : "normal",
        color: style.color,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing * scale,
        opacity: style.opacity,
      }}
    >
      <span className="whitespace-pre-wrap">{text}</span>
    </div>
  )
}

const HANDLES: { corner: Corner; className: string; cursor: string }[] = [
  { corner: "nw", className: "-left-1 -top-1", cursor: "nwse-resize" },
  { corner: "ne", className: "-right-1 -top-1", cursor: "nesw-resize" },
  { corner: "sw", className: "-left-1 -bottom-1", cursor: "nesw-resize" },
  { corner: "se", className: "-right-1 -bottom-1", cursor: "nwse-resize" },
]

export const EditorCanvas = ({
  elements,
  pageSize,
  background,
  backgroundColor,
  scale,
  selectedId,
  onSelect,
  onChange,
}: {
  elements: CertElement[]
  pageSize: PageSize
  background: string | null
  backgroundColor: string | null
  scale: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  onChange: (id: string, patch: Partial<CertElement>) => void
}) => {
  const page = PAGE_DIMENSIONS[pageSize]
  const dragRef = React.useRef<DragState | null>(null)

  const beginDrag = (
    e: React.PointerEvent,
    element: CertElement,
    mode: "move" | "resize",
    corner?: Corner
  ) => {
    e.stopPropagation()
    onSelect(element.id)
    dragRef.current = {
      mode,
      corner,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: element.x,
      startY: element.y,
      startW: element.w,
      startH: element.h,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent, id: string) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return

    const dx = (e.clientX - drag.startClientX) / scale
    const dy = (e.clientY - drag.startClientY) / scale

    if (drag.mode === "move") {
      onChange(id, {
        x: clamp(drag.startX + dx, 0, page.width - drag.startW),
        y: clamp(drag.startY + dy, 0, page.height - drag.startH),
      })
      return
    }

    const patch: Partial<CertElement> = {}
    const corner = drag.corner

    if (corner === "se") {
      patch.w = clamp(drag.startW + dx, MIN_SIZE, page.width - drag.startX)
      patch.h = clamp(drag.startH + dy, MIN_SIZE, page.height - drag.startY)
    } else if (corner === "sw") {
      const w = clamp(drag.startW - dx, MIN_SIZE, drag.startX + drag.startW)
      patch.w = w
      patch.x = drag.startX + drag.startW - w
      patch.h = clamp(drag.startH + dy, MIN_SIZE, page.height - drag.startY)
    } else if (corner === "ne") {
      patch.w = clamp(drag.startW + dx, MIN_SIZE, page.width - drag.startX)
      const h = clamp(drag.startH - dy, MIN_SIZE, drag.startY + drag.startH)
      patch.h = h
      patch.y = drag.startY + drag.startH - h
    } else if (corner === "nw") {
      const w = clamp(drag.startW - dx, MIN_SIZE, drag.startX + drag.startW)
      const h = clamp(drag.startH - dy, MIN_SIZE, drag.startY + drag.startH)
      patch.w = w
      patch.x = drag.startX + drag.startW - w
      patch.h = h
      patch.y = drag.startY + drag.startH - h
    }

    onChange(id, patch)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null
  }

  return (
    <div
      className="relative shadow-lg ring-1 ring-black/10"
      style={{
        width: page.width * scale,
        height: page.height * scale,
        backgroundColor: backgroundColor ?? "#ffffff",
        backgroundImage: background ? `url(${background})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onPointerDown={() => onSelect(null)}
    >
      {[...elements]
        .sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
        .map((element) => {
          const selected = element.id === selectedId
          return (
            <div
              key={element.id}
              className={cn(
                "absolute touch-none select-none cursor-grab active:cursor-grabbing",
                selected ? "outline outline-2 outline-primary" : "outline outline-1 outline-transparent hover:outline-primary/40"
              )}
              style={{
                left: element.x * scale,
                top: element.y * scale,
                width: element.w * scale,
                height: element.h * scale,
              }}
              onPointerDown={(e) => beginDrag(e, element, "move")}
              onPointerMove={(e) => handlePointerMove(e, element.id)}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <ElementContent element={element} scale={scale} />
              {selected &&
                HANDLES.map((handle) => (
                  <span
                    key={handle.corner}
                    className={cn(
                      "absolute size-2 rounded-full border border-primary bg-background",
                      handle.className
                    )}
                    style={{ cursor: handle.cursor }}
                    onPointerDown={(e) => beginDrag(e, element, "resize", handle.corner)}
                    onPointerMove={(e) => handlePointerMove(e, element.id)}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                  />
                ))}
            </div>
          )
        })}
    </div>
  )
}
