'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail, UserListResponse } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import CoverImageField from './cover-image-field'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'

interface CourseFormProps {
  initial?: CourseDetail
  onSaved: (c: CourseDetail) => void
}

type InstructorOption = { value: string; label: string }

const CourseForm = ({ initial, onSaved }: CourseFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [instructorId, setInstructorId] = useState(initial?.instructor.id ?? '')
  const [instructors, setInstructors] = useState<InstructorOption[]>([])
  const [loadingInstructors, setLoadingInstructors] = useState(true)
  const [instructorsError, setInstructorsError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await apiFetch<UserListResponse>('/users?role=instrutor&pageSize=100')
        if (active) setInstructors(res.items.map((u) => ({ value: u.id, label: u.name })))
      } catch {
        if (active) setInstructorsError('Não foi possível carregar os instrutores.')
      } finally {
        if (active) setLoadingInstructors(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const selectedInstructor = useMemo(
    () => instructors.find((i) => i.value === instructorId) ?? null,
    [instructors, instructorId],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        title,
        description: description || undefined,
        coverImage: coverImage || null,
        slug: slug || undefined,
        instructorId: instructorId || undefined,
      }
      const course = initial
        ? await apiFetch<CourseDetail>(`/courses/${initial.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await apiFetch<CourseDetail>('/courses', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
      onSaved(course)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Este slug já está em uso. Escolha outro ou deixe em branco para gerar automaticamente.')
      } else {
        setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o curso.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="course-title">Título</Label>
        <Input
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Título do curso"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="course-instructor">Instrutor</Label>
        {loadingInstructors ? (
          <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            Carregando instrutores...
          </div>
        ) : instructorsError ? (
          <p className="text-sm text-destructive" role="alert">
            {instructorsError}
          </p>
        ) : instructors.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum instrutor disponível no momento.</p>
        ) : (
          <Combobox
            items={instructors}
            value={selectedInstructor}
            onValueChange={(item) => setInstructorId((item as InstructorOption | null)?.value ?? '')}
            itemToStringLabel={(item: InstructorOption) => item?.label ?? ''}
            isItemEqualToValue={(a: InstructorOption, b: InstructorOption) => a?.value === b?.value}
          >
            <ComboboxInput id="course-instructor" placeholder="Buscar instrutor..." />
            <ComboboxContent>
              <ComboboxEmpty>Nenhum instrutor encontrado.</ComboboxEmpty>
              <ComboboxList>
                {(item: InstructorOption) => (
                  <ComboboxItem key={item.value} value={item}>
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="course-description">Descrição</Label>
        <Textarea
          id="course-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do curso (opcional)"
          rows={4}
        />
      </div>
      <CoverImageField value={coverImage} onChange={setCoverImage} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="course-slug">Slug</Label>
        <Input
          id="course-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="gerado do título"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar curso'}
      </Button>
    </form>
  )
}

export default CourseForm
