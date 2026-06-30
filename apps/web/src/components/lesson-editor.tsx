'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Lesson, LessonSummary, VideoSource } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface LessonEditorProps {
  lesson: LessonSummary
  onChange: () => void | Promise<void>
}

const VIDEO_SOURCES: { value: VideoSource; label: string }[] = [
  { value: 'NONE', label: 'Sem vídeo' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'VIMEO', label: 'Vimeo' },
  { value: 'MUX', label: 'Mux' },
]

const LessonEditor = ({ lesson, onChange }: LessonEditorProps) => {
  const [open, setOpen] = useState(false)
  const [full, setFull] = useState<Lesson | null>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [videoSource, setVideoSource] = useState<VideoSource>('NONE')
  const [videoRef, setVideoRef] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [attName, setAttName] = useState('')
  const [attUrl, setAttUrl] = useState('')
  const [addingAtt, setAddingAtt] = useState(false)
  const [attError, setAttError] = useState<string | null>(null)
  const [deletingAttId, setDeletingAttId] = useState<string | null>(null)

  const openDialog = async () => {
    setOpen(true)
    setFetchError(null)
    setSaveError(null)
    setAttError(null)
    setFetching(true)
    try {
      const data = await apiFetch<Lesson>(`/lessons/${lesson.id}`)
      setFull(data)
      setTitle(data.title)
      setContent(data.content ?? '')
      setVideoSource(data.videoSource)
      setVideoRef(data.videoRef ?? '')
      setDurationSec(data.durationSec?.toString() ?? '')
    } catch (err) {
      setFetchError(err instanceof ApiError ? err.message : 'Não foi possível carregar a aula.')
    } finally {
      setFetching(false)
    }
  }

  const closeDialog = () => {
    setOpen(false)
    setFull(null)
    setSaveError(null)
    setAttError(null)
    setAttName('')
    setAttUrl('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      await apiFetch(`/lessons/${lesson.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          content: content || null,
          videoSource,
          videoRef: videoRef || null,
          durationSec: durationSec ? parseInt(durationSec, 10) : null,
        }),
      })
      closeDialog()
      await onChange()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Não foi possível salvar a aula.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Excluir a aula "${lesson.title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await apiFetch(`/lessons/${lesson.id}`, { method: 'DELETE' })
      await onChange()
      closeDialog()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Não foi possível excluir a aula.')
      setDeleting(false)
    }
  }

  const refetchFull = async () => {
    try {
      const data = await apiFetch<Lesson>(`/lessons/${lesson.id}`)
      setFull(data)
    } catch {
      setAttError('Anexo atualizado, mas não foi possível recarregar a lista.')
    }
  }

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttError(null)
    setAddingAtt(true)
    try {
      await apiFetch(`/lessons/${lesson.id}/attachments`, {
        method: 'POST',
        body: JSON.stringify({ name: attName, url: attUrl }),
      })
      setAttName('')
      setAttUrl('')
      await refetchFull()
    } catch (err) {
      setAttError(err instanceof ApiError ? err.message : 'Não foi possível adicionar o anexo.')
    } finally {
      setAddingAtt(false)
    }
  }

  const handleDeleteAttachment = async (attId: string) => {
    setAttError(null)
    setDeletingAttId(attId)
    try {
      await apiFetch(`/attachments/${attId}`, { method: 'DELETE' })
      await refetchFull()
    } catch (err) {
      setAttError(err instanceof ApiError ? err.message : 'Não foi possível excluir o anexo.')
    } finally {
      setDeletingAttId(null)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
      <span className="text-sm text-brand-navy">{lesson.title}</span>
      <Button size="sm" variant="ghost" onClick={openDialog}>
        Editar
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) closeDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar aula</DialogTitle>
            <DialogDescription>Edite os dados e o conteúdo desta aula.</DialogDescription>
          </DialogHeader>
          {fetching && (
            <div className="flex justify-center py-8">
              <Spinner className="size-6" />
            </div>
          )}
          {fetchError && (
            <p className="text-sm text-destructive" role="alert">
              {fetchError}
            </p>
          )}
          {full && !fetching && (
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lesson-edit-title">Título</Label>
                <Input
                  id="lesson-edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lesson-edit-content">Conteúdo</Label>
                <Textarea
                  id="lesson-edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Conteúdo da aula (opcional)"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lesson-edit-vsource">Fonte do vídeo</Label>
                <Select
                  value={videoSource}
                  onValueChange={(v) => setVideoSource(v as VideoSource)}
                >
                  <SelectTrigger id="lesson-edit-vsource" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {videoSource !== 'NONE' && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lesson-edit-vref">Referência do vídeo</Label>
                  <Input
                    id="lesson-edit-vref"
                    value={videoRef}
                    onChange={(e) => setVideoRef(e.target.value)}
                    placeholder="ID ou URL do vídeo"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lesson-edit-dur">Duração (segundos)</Label>
                <Input
                  id="lesson-edit-dur"
                  type="number"
                  value={durationSec}
                  onChange={(e) => setDurationSec(e.target.value)}
                  placeholder="0"
                  min={0}
                />
              </div>

              {saveError && (
                <p className="text-sm text-destructive" role="alert">
                  {saveError}
                </p>
              )}

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting || saving}
                >
                  {deleting ? 'Excluindo...' : 'Excluir aula'}
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={closeDialog} disabled={saving || deleting}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={saving || deleting}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>

              <hr className="border-slate-200" />

              <div>
                <h3 className="mb-3 font-display text-sm font-semibold text-brand-navy">Anexos</h3>
                {full.attachments.length > 0 ? (
                  <ul className="mb-4 flex flex-col gap-2">
                    {full.attachments.map((att) => (
                      <li key={att.id} className="flex items-center justify-between text-sm">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-blue hover:underline"
                        >
                          {att.name}
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAttachment(att.id)}
                          disabled={deletingAttId === att.id}
                        >
                          Remover
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-4 text-sm text-slate-500">Nenhum anexo ainda.</p>
                )}
                <form onSubmit={handleAddAttachment} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      value={attName}
                      onChange={(e) => setAttName(e.target.value)}
                      placeholder="Nome"
                      required
                      className="flex-1"
                    />
                    <Input
                      type="url"
                      value={attUrl}
                      onChange={(e) => setAttUrl(e.target.value)}
                      placeholder="URL"
                      required
                      className="flex-1"
                    />
                  </div>
                  {attError && (
                    <p className="text-sm text-destructive" role="alert">
                      {attError}
                    </p>
                  )}
                  <Button type="submit" size="sm" variant="outline" disabled={addingAtt}>
                    {addingAtt ? 'Adicionando...' : 'Adicionar anexo'}
                  </Button>
                </form>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LessonEditor
