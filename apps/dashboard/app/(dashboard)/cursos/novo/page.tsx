import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { NewCourseForm } from "@/components/dashboard/course-detail/new-course-form"

const NewCoursePage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/cursos" className="transition-colors hover:text-foreground">
          Meus cursos
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">Novo curso</span>
      </nav>

      <PageHeader title="Criar novo curso" description="Defina as informações principais. Depois você adiciona os módulos e as aulas." />

      <NewCourseForm />
    </div>
  )
}

export default NewCoursePage
