"use client"

import * as React from "react"
import { FileVideo, UploadCloud, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { contentTypes, courseModules, moduleLessons } from "@/lib/mock/content"
import type { ContentKind } from "@/types"

interface UploadItem {
  name: string
  size: string
  progress: number
}

export const ContentForm = () => {
  const [kind, setKind] = React.useState<ContentKind>("video")
  const [dragging, setDragging] = React.useState(false)
  const [files, setFiles] = React.useState<UploadItem[]>([
    { name: "aula-01-introducao.mp4", size: "248 MB", progress: 100 },
    { name: "aula-02-conceitos.mp4", size: "312 MB", progress: 64 },
  ])
  const inputRef = React.useRef<HTMLInputElement>(null)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    const next = Array.from(list).map((f) => ({
      name: f.name,
      size: `${(f.size / 1_048_576).toFixed(0)} MB`,
      progress: 100,
    }))
    setFiles((prev) => [...prev, ...next])
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipo de conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {contentTypes.map((option) => {
                const selected = kind === option.kind
                return (
                  <button
                    key={option.kind}
                    onClick={() => setKind(option.kind)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/40 hover:bg-accent/40"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg",
                        selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <option.icon className="size-4.5" />
                    </span>
                    <span className="text-sm font-medium leading-tight">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título do conteúdo</Label>
              <Input id="title" placeholder="Ex: Introdução à alfabetização adaptada" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Descreva o que o aluno vai aprender neste conteúdo..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload de arquivos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                addFiles(e.dataTransfer.files)
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-accent/30"
              )}
            >
              <UploadCloud className="mb-3 size-9 text-primary" />
              <p className="text-sm font-medium">Arraste e solte seus vídeos aqui</p>
              <p className="text-xs text-muted-foreground">ou clique para enviar · MP4, MOV, AVI até 2GB</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <ul className="flex flex-col gap-2">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileVideo className="size-4.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{file.size}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={file.progress} className="h-1.5 flex-1" />
                        <span className="w-16 text-right text-xs text-muted-foreground">
                          {file.progress === 100 ? "Concluído" : `${file.progress}%`}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label="Remover"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Informações adicionais</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Módulo</Label>
              <Select
                defaultValue={courseModules[0].id}
                items={Object.fromEntries(courseModules.map((m) => [m.id, m.name]))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courseModules.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Aula</Label>
              <Select
                defaultValue={moduleLessons[0].id}
                items={Object.fromEntries(moduleLessons.map((l) => [l.id, l.name]))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moduleLessons.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duração</Label>
              <Input id="duration" placeholder="00:00:00" />
            </div>
            <div className="grid gap-2">
              <Label>Miniatura</Label>
              <button className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30">
                <UploadCloud className="mb-1 size-6" />
                <span className="text-xs">Enviar imagem</span>
              </button>
            </div>

            <div className="mt-2 flex flex-col gap-2 border-t pt-4">
              <Button className="w-full">Publicar conteúdo</Button>
              <Button variant="outline" className="w-full">
                Salvar rascunho
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
