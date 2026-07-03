'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { ModuleWithLessons } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LessonEditor from './lesson-editor'

interface ModuleEditorProps {
  module: ModuleWithLessons
  courseSlug: string
  onChange: () => void | Promise<void>
}

const ModuleEditor = ({ module, courseSlug, onChange }: ModuleEditorProps) => {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(module.title)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [adding, setAdding] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError(null)
    setSaving(true)
    try {
      await apiFetch(`/modules/${module.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      })
      await onChange()
      setEditing(false)
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Não foi possível salvar o módulo.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Excluir o módulo "${module.title}" e todas as suas aulas? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    try {
      await apiFetch(`/modules/${module.id}`, { method: 'DELETE' })
      await onChange()
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Não foi possível excluir o módulo.')
      setDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setTitle(module.title)
    setEditError(null)
  }

  const handleCancelAdd = () => {
    setAdding(false)
    setLessonTitle('')
    setAddError(null)
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)
    setAddLoading(true)
    try {
      await apiFetch(`/modules/${module.id}/lessons`, {
        method: 'POST',
        body: JSON.stringify({ title: lessonTitle }),
      })
      await onChange()
      setLessonTitle('')
      setAdding(false)
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : 'Não foi possível criar a aula.')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div className="rounded-card bg-white p-5 shadow-card ring-1 ring-brand-navy/[0.06]">
      <div className="flex items-center justify-between gap-4">
        {editing ? (
          <form onSubmit={handleSave} className="flex flex-1 items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleCancelEdit}>
              Cancelar
            </Button>
          </form>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-navy-50 text-xs font-bold text-brand-navy">
                {module.order}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-display font-bold text-brand-navy">{module.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {module.lessons.length} aula{module.lessons.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                Renomear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleting}
                className="text-muted-foreground hover:text-destructive"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            </div>
          </>
        )}
      </div>

      {editError && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {editError}
        </p>
      )}

      <div className="mt-4 border-t border-hairline pt-4">
        {module.lessons.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {module.lessons.map((lesson) => (
              <LessonEditor key={lesson.id} lesson={lesson} courseSlug={courseSlug} />
            ))}
          </div>
        )}

        {adding ? (
          <form onSubmit={handleAddLesson} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                required
                autoFocus
                placeholder="Título da nova aula"
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={addLoading}>
                {addLoading ? 'Criando...' : 'Adicionar'}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleCancelAdd} disabled={addLoading}>
                Cancelar
              </Button>
            </div>
            {addError && (
              <p className="text-sm text-destructive" role="alert">
                {addError}
              </p>
            )}
          </form>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAdding(true)}
            className="w-full border-dashed text-muted-foreground hover:text-brand-navy"
          >
            <Plus className="size-4" aria-hidden />
            Nova aula
          </Button>
        )}
      </div>
    </div>
  )
}

export default ModuleEditor
