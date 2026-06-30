'use client'

import { useRouter } from 'next/navigation'
import type { CourseDetail } from '@/lib/types'
import CourseForm from '@/components/course-form'

const NovoCursoPage = () => {
  const router = useRouter()

  const handleSaved = (c: CourseDetail) => {
    router.push(`/admin/cursos/${c.slug}`)
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-brand-navy">Novo curso</h1>
      <CourseForm onSaved={handleSaved} />
    </div>
  )
}

export default NovoCursoPage
