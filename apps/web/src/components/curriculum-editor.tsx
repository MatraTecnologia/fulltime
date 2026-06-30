'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import ModuleEditor from './module-editor'

interface CurriculumEditorProps {
  course: CourseDetail
  onChange: () => void | Promise<void>
}

const CurriculumEditor = ({ course, onChange }: CurriculumEditorProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await apiFetch(`/courses/${course.id}/modules`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      })
      setTitle('')
      setDialogOpen(false)
      await onChange()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o módulo.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
    setTitle('')
    setError(null)
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-brand-navy">Currículo</h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          Novo módulo
        </Button>
      </div>

      {course.modules.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nenhum módulo ainda</EmptyTitle>
            <EmptyDescription>Adicione módulos para organizar as aulas do curso.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {course.modules.map((m) => (
            <ModuleEditor key={m.id} module={m} onChange={onChange} />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) handleClose() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo módulo</DialogTitle>
            <DialogDescription>Preencha o título para criar um novo módulo no curso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-module-title">Título</Label>
              <Input
                id="new-module-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Título do módulo"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Criando...' : 'Criar módulo'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CurriculumEditor
