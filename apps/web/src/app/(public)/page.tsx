import Image from 'next/image'
import { apiServer } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { CourseCard } from '@/components/course-card'

export const dynamic = 'force-dynamic'

const btnPrimary =
  'inline-flex items-center justify-center rounded-lg font-display font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 bg-brand-navy text-white hover:bg-brand-navy-600 h-11 px-5 text-base'

const btnOutline =
  'inline-flex items-center justify-center rounded-lg font-display font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 border-2 border-brand-navy text-brand-navy hover:bg-brand-navy-50 h-11 px-5 text-base'

const HomePage = async () => {
  const courses = await apiServer<CourseListItem[]>('/courses')
  const featured = courses.slice(0, 6)

  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <Image src="/logo.svg" alt="Full Time" width={96} height={96} priority className="mb-8" />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-brand-navy">
        Acolher · Desenvolver · Incluir
      </h1>
      <p className="mt-4 max-w-xl text-lg text-brand-navy/70">
        Capacitação para profissionais que transformam a vida de crianças atípicas.
      </p>
      <div className="mt-8 flex gap-4">
        <a href="/cursos" className={btnPrimary}>Explorar cursos</a>
        <a href="/cadastro" className={btnOutline}>Criar conta</a>
      </div>

      {featured.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-extrabold text-brand-navy">Cursos em destaque</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
          <div className="mt-8 text-center">
            <a href="/cursos" className={btnOutline}>Ver todos os cursos</a>
          </div>
        </section>
      )}
    </main>
  )
}

export default HomePage
