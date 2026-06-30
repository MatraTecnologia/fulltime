'use client'

import { useState } from 'react'
import { apiFetch, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { Button, Field, Input, Textarea } from '@fulltime/ui'

interface CourseFormProps {
  initial?: CourseDetail
  onSaved: (c: CourseDetail) => void
}

const CourseForm = ({ initial, onSaved }: CourseFormProps) => {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        title,
        description: description || undefined,
        coverImage: coverImage || undefined,
        slug: slug || undefined,
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
      <Field label="Título" htmlFor="course-title">
        <Input
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Título do curso"
        />
      </Field>
      <Field label="Descrição" htmlFor="course-description">
        <Textarea
          id="course-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do curso (opcional)"
          rows={4}
        />
      </Field>
      <Field label="Imagem de capa (URL)" htmlFor="course-cover">
        <Input
          id="course-cover"
          type="url"
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="https://..."
        />
      </Field>
      <Field label="Slug" htmlFor="course-slug">
        <Input
          id="course-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="gerado do título"
        />
      </Field>
      {error && (
        <p className="text-sm text-red-600" role="alert">
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
