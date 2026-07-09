"use client"

import * as React from "react"
import { File, Link2, Trash2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useCreateAttachment, useDeleteAttachment } from "@/hooks/use-course-detail"
import { getApiErrorMessage } from "@/lib/api"
import { uploadFile } from "@/services/uploads"
import type { LessonAttachment } from "@/services/courses-detail"

export const LessonMaterialsSection = ({
  lessonId,
  attachments,
  loading,
}: {
  lessonId: string
  attachments: LessonAttachment[]
  loading: boolean
}) => {
  const createAttachment = useCreateAttachment(lessonId)
  const deleteAttachment = useDeleteAttachment(lessonId)

  const [uploading, setUploading] = React.useState(false)
  const [linkName, setLinkName] = React.useState("")
  const [linkUrl, setLinkUrl] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const busy = uploading || createAttachment.isPending

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploading(true)
    let url: string
    try {
      url = await uploadFile(file)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      setUploading(false)
      return
    }
    try {
      await createAttachment.mutateAsync({ name: file.name, url, type: file.type || undefined })
    } catch {
      // erro já tratado pelo hook via toast
    } finally {
      setUploading(false)
    }
  }

  const handleAddLink = async () => {
    if (!linkName.trim() || !linkUrl.trim() || busy) return
    let parsed: URL
    try {
      parsed = new URL(linkUrl.trim())
    } catch {
      toast.error("URL inválida.")
      return
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      toast.error("Use uma URL http(s) válida.")
      return
    }
    try {
      await createAttachment.mutateAsync({ name: linkName.trim(), url: linkUrl.trim() })
      setLinkName("")
      setLinkUrl("")
    } catch {
      // erro já tratado pelo hook via toast
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Materiais</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum material anexado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center gap-3 rounded-lg border bg-background p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <File className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={/^https?:\/\//i.test(attachment.url) ? attachment.url : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {attachment.name}
                  </a>
                  {attachment.type && (
                    <p className="truncate text-xs text-muted-foreground">{attachment.type}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground"
                  aria-label="Remover material"
                  disabled={deleteAttachment.isPending}
                  onClick={() => deleteAttachment.mutate(attachment.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.csv,image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-accent/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? (
            <Spinner />
          ) : (
            <>
              <UploadCloud className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">Enviar arquivo</p>
              <p className="text-xs text-muted-foreground">PDF, DOC, PPT, XLS, ZIP · até 25MB</p>
            </>
          )}
        </button>

        <div className="flex flex-col gap-3 border-t pt-4">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Link2 className="size-4 text-muted-foreground" />
            Adicionar link externo
          </p>
          <div className="grid gap-2">
            <Label htmlFor="material-link-name">Nome</Label>
            <Input
              id="material-link-name"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
              placeholder="Ex: Apostila complementar"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="material-link-url">URL</Label>
            <Input
              id="material-link-url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={handleAddLink}
            disabled={!linkName.trim() || !linkUrl.trim() || busy}
          >
            {createAttachment.isPending && <Spinner />}
            Adicionar link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
