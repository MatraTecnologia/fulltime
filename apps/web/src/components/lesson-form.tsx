'use client'

import { useEffect, useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { Lesson, VideoSource } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { VideoUploader } from '@/app/(admin)/_components/video-uploader'
import VideoLibraryPicker from './video-library-picker'

interface LessonFormProps {
  lessonId: string
  onSaved?: () => void
  onDeleted?: () => void
}

const VIDEO_SOURCES: { value: VideoSource; label: string }[] = [
  { value: 'NONE', label: 'Sem vídeo' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'VIMEO', label: 'Vimeo' },
  { value: 'MUX', label: 'Mux' },
]

const LessonForm = ({ lessonId, onSaved, onDeleted }: LessonFormProps) => {
  const [full, setFull] = useState<Lesson | null>(null)
  const [fetching, setFetching] = useState(true)
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

  const hydrate = (data: Lesson) => {
    setFull(data)
    setTitle(data.title)
    setContent(data.content ?? '')
    setVideoSource(data.videoSource)
    setVideoRef(data.videoRef ?? '')
    setDurationSec(data.durationSec?.toString() ?? '')
  }

  useEffect(() => {
    let active = true
    setFetching(true)
    apiFetch<Lesson>(`/lessons/${lessonId}`)
      .then((data) => { if (active) hydrate(data) })
      .catch((err) => { if (active) setFetchError(err instanceof ApiError ? err.message : 'Não foi possível carregar a aula.') })
      .finally(() => { if (active) setFetching(false) })
    return () => { active = false }
  }, [lessonId])

  const refetchFull = async () => {
    try {
      const data = await apiFetch<Lesson>(`/lessons/${lessonId}`)
      setFull(data)
    } catch {
      setAttError('Anexo atualizado, mas não foi possível recarregar a lista.')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSaving(true)
    try {
      await apiFetch(`/lessons/${lessonId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          content: content || null,
          videoSource,
          videoRef: videoRef || null,
          durationSec: durationSec ? parseInt(durationSec, 10) : null,
        }),
      })
      onSaved?.()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Não foi possível salvar a aula.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Excluir a aula "${title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await apiFetch(`/lessons/${lessonId}`, { method: 'DELETE' })
      onDeleted?.()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Não foi possível excluir a aula.')
      setDeleting(false)
    }
  }

  const handleVideoLinked = async () => {
    setSaveError(null)
    try {
      const data = await apiFetch<Lesson>(`/lessons/${lessonId}`)
      hydrate(data)
    } catch {
      setSaveError('Vídeo vinculado, mas não foi possível recarregar a aula.')
    }
  }

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    setAttError(null)
    setAddingAtt(true)
    try {
      await apiFetch(`/lessons/${lessonId}/attachments`, {
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

  if (fetching) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (fetchError || !full) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {fetchError ?? 'Aula não encontrada.'}
      </p>
    )
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-brand-navy/[0.06]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-edit-title">Título</Label>
            <Input id="lesson-edit-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-edit-content">Conteúdo</Label>
            <Textarea
              id="lesson-edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Conteúdo da aula (opcional)"
            />
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-brand-navy/[0.06]">
        <h2 className="mb-4 font-display text-base font-bold text-brand-navy">Vídeo</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson-edit-vsource">Fonte do vídeo</Label>
            <Select value={videoSource} onValueChange={(v) => setVideoSource(v as VideoSource)}>
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
              {videoSource === 'MUX' && (
                <p className="text-xs text-muted-foreground">Preencha manualmente ou envie um arquivo abaixo.</p>
              )}
            </div>
          )}

          {videoSource === 'MUX' && (
            <div className="flex flex-col gap-3 rounded-card border border-hairline bg-brand-navy-50/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <Label className="mb-0">Vídeo Mux</Label>
                <VideoLibraryPicker lessonId={lessonId} onLinked={handleVideoLinked} />
              </div>
              <VideoUploader lessonId={lessonId} onSuccess={() => { void handleVideoLinked() }} />
              <p className="text-xs text-muted-foreground">
                Envie um novo arquivo ou escolha um vídeo já processado na biblioteca. Ao concluir, o vídeo é vinculado a esta aula.
              </p>
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
        </div>
      </div>

      <div className="rounded-card bg-white p-6 shadow-card ring-1 ring-brand-navy/[0.06]">
        <h2 className="mb-4 font-display text-base font-bold text-brand-navy">Anexos</h2>
        {full.attachments.length > 0 ? (
          <ul className="mb-4 flex flex-col gap-2">
            {full.attachments.map((att) => (
              <li key={att.id} className="flex items-center justify-between text-sm">
                <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
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
          <p className="mb-4 text-sm text-muted-foreground">Nenhum anexo ainda.</p>
        )}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input value={attName} onChange={(e) => setAttName(e.target.value)} placeholder="Nome" className="flex-1" />
            <Input type="url" value={attUrl} onChange={(e) => setAttUrl(e.target.value)} placeholder="URL" className="flex-1" />
          </div>
          {attError && (
            <p className="text-sm text-destructive" role="alert">
              {attError}
            </p>
          )}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={addingAtt || !attName || !attUrl}
            onClick={(e) => { void handleAddAttachment(e as unknown as React.FormEvent) }}
          >
            {addingAtt ? 'Adicionando...' : 'Adicionar anexo'}
          </Button>
        </div>
      </div>

      {saveError && (
        <p className="text-sm text-destructive" role="alert">
          {saveError}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={handleDelete} disabled={deleting || saving}>
          {deleting ? 'Excluindo...' : 'Excluir aula'}
        </Button>
        <Button type="submit" disabled={saving || deleting}>
          {saving ? 'Salvando...' : 'Salvar aula'}
        </Button>
      </div>
    </form>
  )
}

export default LessonForm
