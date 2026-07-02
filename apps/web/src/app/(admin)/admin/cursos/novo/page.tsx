'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { CourseDetail } from '@/lib/types'
import CourseForm from '@/components/course-form'
import { PageHeader } from '../../../_components/page-header'

const NovoCursoPage = () => {
  const router = useRouter()

  const handleSaved = (c: CourseDetail) => {
    router.push(`/admin/cursos/${c.slug}`)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/admin/cursos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-navy"
      >
        <ArrowLeft className="size-4" />
        Cursos
      </Link>
      <PageHeader title="Novo curso" description="Preencha as informações básicas do curso." />
      <CourseForm onSaved={handleSaved} />
    </div>
  )
}

export default NovoCursoPage
