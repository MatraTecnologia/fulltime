'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import type { LessonSummary } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface LessonEditorProps {
  lesson: LessonSummary
  courseSlug: string
}

const formatDuration = (sec: number | null) => {
  if (!sec) return null
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const LessonEditor = ({ lesson, courseSlug }: LessonEditorProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-hairline bg-white px-3 py-2.5 transition-colors hover:border-brand-navy/20">
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-navy-50 text-xs font-semibold text-brand-navy">
      {lesson.order}
    </span>
    <span className="min-w-0 flex-1 truncate text-sm text-brand-navy">{lesson.title}</span>
    {formatDuration(lesson.durationSec) && (
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatDuration(lesson.durationSec)}
      </span>
    )}
    <Button size="sm" variant="ghost" asChild className="shrink-0">
      <Link href={`/admin/cursos/${courseSlug}/aulas/${lesson.id}`}>
        <Pencil className="size-3.5" />
        Editar
      </Link>
    </Button>
  </div>
)

export default LessonEditor
