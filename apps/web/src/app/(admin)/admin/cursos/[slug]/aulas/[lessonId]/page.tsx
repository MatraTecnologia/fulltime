'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import LessonForm from '@/components/lesson-form'

const EditarAulaPage = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const router = useRouter()

  const back = () => router.push(`/admin/cursos/${slug}`)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/admin/cursos/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-navy"
      >
        <ArrowLeft className="size-4" />
        Voltar ao curso
      </Link>

      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-navy">Editar aula</h1>
        <p className="text-sm text-muted-foreground">Edite os dados, o vídeo e os anexos desta aula.</p>
      </div>

      <LessonForm lessonId={lessonId} onSaved={back} onDeleted={back} />
    </div>
  )
}

export default EditarAulaPage
