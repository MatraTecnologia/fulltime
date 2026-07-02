'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CourseWizard from '@/components/course-wizard'
import { PageHeader } from '../../../_components/page-header'

const NovoCursoPage = () => (
  <div className="mx-auto max-w-3xl space-y-8">
    <Link
      href="/admin/cursos"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-navy"
    >
      <ArrowLeft className="size-4" />
      Cursos
    </Link>
    <PageHeader title="Novo curso" description="Crie o curso em três etapas: dados, currículo e publicação." />
    <CourseWizard />
  </div>
)

export default NovoCursoPage
