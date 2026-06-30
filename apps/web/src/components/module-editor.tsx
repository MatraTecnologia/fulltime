'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { ModuleWithLessons } from '@/lib/types'
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, EmptyState, Field, Input } from '@fulltime/ui'
import LessonEditor from './lesson-editor'

interface ModuleEditorProps {
  module: ModuleWithLessons
  onChange: () => void | Promise<void>
}

const ModuleEditor = ({ module, onChange }: ModuleEditorProps) => {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(module.title)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
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

  const handleCloseAdd = () => {
    setAddOpen(false)
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
      handleCloseAdd()
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : 'Não foi possível criar a aula.')
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
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
              <CardTitle>{module.title}</CardTitle>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                  Renomear
                </Button>
                <Button size="sm" variant="outline" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            </>
          )}
        </div>
        {editError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {editError}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {module.lessons.length === 0 ? (
          <EmptyState title="Nenhuma aula ainda" className="py-8" />
        ) : (
          <div className="mb-4 flex flex-col gap-2">
            {module.lessons.map((lesson) => (
              <LessonEditor key={lesson.id} lesson={lesson} onChange={onChange} />
            ))}
          </div>
        )}
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          Nova aula
        </Button>
      </CardContent>

      <Dialog open={addOpen} onClose={handleCloseAdd} title="Nova aula">
        <form onSubmit={handleAddLesson} className="flex flex-col gap-4">
          <Field label="Título" htmlFor="new-lesson-title">
            <Input
              id="new-lesson-title"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              required
              placeholder="Título da aula"
              autoFocus
            />
          </Field>
          {addError && (
            <p className="text-sm text-red-600" role="alert">
              {addError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseAdd}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={addLoading}>
              {addLoading ? 'Criando...' : 'Criar aula'}
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  )
}

export default ModuleEditor
