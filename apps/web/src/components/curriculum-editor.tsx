'use client'

import { useState } from 'react'
import { Layers, Plus } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import ModuleEditor from './module-editor'

interface CurriculumEditorProps {
  course: CourseDetail
  onChange: () => void | Promise<void>
}

const CurriculumEditor = ({ course, onChange }: CurriculumEditorProps) => {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const modules = course.modules ?? []

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
      setAdding(false)
      await onChange()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar o módulo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setAdding(false)
    setTitle('')
    setError(null)
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-navy">Currículo</h2>
          <p className="text-sm text-muted-foreground">
            {modules.length} módulo{modules.length !== 1 ? 's' : ''} neste curso
          </p>
        </div>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden />
            Novo módulo
          </Button>
        )}
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="mb-4 rounded-card bg-white p-4 shadow-card ring-1 ring-brand-navy/[0.06]"
        >
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Título do módulo"
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Criando...' : 'Criar módulo'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancelar
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      {modules.length === 0 ? (
        <Empty className="rounded-card border-none bg-white shadow-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>Nenhum módulo ainda</EmptyTitle>
            <EmptyDescription>
              Adicione módulos para organizar as aulas do curso em seções.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {modules.map((m) => (
            <ModuleEditor key={m.id} module={m} courseSlug={course.slug} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CurriculumEditor
