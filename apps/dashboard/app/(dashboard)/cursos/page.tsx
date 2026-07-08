import { Plus } from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { CoursesTable } from "@/components/dashboard/courses-table"
import { courseRows } from "@/lib/mock/courses"

const CoursesPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader title="Meus cursos" description="Gerencie, edite e acompanhe o desempenho dos seus cursos.">
        <Button render={<Link href="/cursos/novo" />} nativeButton={false} className="gap-1.5">
          <Plus className="size-4" />
          Novo curso
        </Button>
      </PageHeader>

      <CoursesTable courses={courseRows} />
    </div>
  )
}

export default CoursesPage
