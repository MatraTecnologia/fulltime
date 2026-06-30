export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { apiServer, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/lib/types'
import { EnrollButton } from '@/components/enroll-button'

const CoursePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  let course: CourseDetail
  try {
    course = await apiServer<CourseDetail>(`/courses/${slug}`)
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound()
    throw e
  }
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-brand-navy">{course.title}</h1>
      <p className="mt-3 text-brand-navy/70">{course.description}</p>
      <EnrollButton courseId={course.id} slug={course.slug} />
      <section className="mt-10 space-y-6">
        {course.modules.map((m) => (
          <div key={m.id}>
            <h2 className="font-semibold text-brand-navy">{m.title}</h2>
            <ul className="mt-2 space-y-1 text-sm text-brand-navy/70">
              {m.lessons.map((l) => <li key={l.id}>{l.order}. {l.title}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </main>
  )
}

export default CoursePage
