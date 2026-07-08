"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  BookOpen,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CourseStatusBadge } from "@/components/dashboard/course-status-badge"
import { StarRating } from "@/components/dashboard/star-rating"
import { EmptyState } from "@/components/dashboard/empty-state"
import { formatNumber } from "@/lib/utils"
import type { CourseRow, CourseStatus } from "@/types"

type TabKey = "PUBLISHED" | "DRAFT" | "ARCHIVED"
type SortKey = "recent" | "students" | "rating" | "completion"

const PAGE_SIZE = 6

const tabsMeta: { key: TabKey; label: string; status: CourseStatus }[] = [
  { key: "PUBLISHED", label: "Publicados", status: "PUBLISHED" },
  { key: "DRAFT", label: "Rascunhos", status: "DRAFT" },
  { key: "ARCHIVED", label: "Arquivados", status: "ARCHIVED" },
]

const sorters: Record<SortKey, (a: CourseRow, b: CourseRow) => number> = {
  recent: () => 0,
  students: (a, b) => b.students - a.students,
  rating: (a, b) => b.rating - a.rating,
  completion: (a, b) => b.completionRate - a.completionRate,
}

export const CoursesTable = ({ courses }: { courses: CourseRow[] }) => {
  const [tab, setTab] = React.useState<TabKey>("PUBLISHED")
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<SortKey>("recent")
  const [page, setPage] = React.useState(1)

  const counts = React.useMemo(
    () => ({
      PUBLISHED: courses.filter((c) => c.status === "PUBLISHED").length,
      DRAFT: courses.filter((c) => c.status === "DRAFT").length,
      ARCHIVED: courses.filter((c) => c.status === "ARCHIVED").length,
    }),
    [courses]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses
      .filter((c) => c.status === tab)
      .filter((c) => (q ? c.title.toLowerCase().includes(q) : true))
      .sort(sorters[sort])
  }, [courses, tab, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const changeTab = (next: TabKey) => {
    setTab(next)
    setPage(1)
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={tab} onValueChange={(v) => changeTab(v as TabKey)}>
          <TabsList>
            {tabsMeta.map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="gap-1.5">
                {t.label}
                <span className="rounded bg-muted px-1.5 text-xs text-muted-foreground data-[active]:bg-primary/10">
                  {counts[t.key]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar curso..."
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring"
            />
          </div>
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as SortKey)}
            items={{
              recent: "Mais recentes",
              students: "Mais alunos",
              rating: "Melhor avaliação",
              completion: "Maior conclusão",
            }}
          >
            <SelectTrigger size="sm" className="h-9 w-40">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="students">Mais alunos</SelectItem>
              <SelectItem value="rating">Melhor avaliação</SelectItem>
              <SelectItem value="completion">Maior conclusão</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum curso encontrado"
          description="Ajuste a busca ou crie um novo curso para começar."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Curso</TableHead>
              <TableHead className="text-center">Aulas</TableHead>
              <TableHead className="text-center">Alunos</TableHead>
              <TableHead className="w-40">Conclusão</TableHead>
              <TableHead className="text-center">Avaliação</TableHead>
              <TableHead className="pr-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <BookOpen className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/cursos/${course.slug}`} className="truncate font-medium hover:text-primary hover:underline">
                        {course.title}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <CourseStatusBadge status={course.status} />
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {course.durationLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm tabular-nums">{course.lessons}</TableCell>
                <TableCell className="text-center text-sm tabular-nums">
                  {formatNumber(course.students)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={course.completionRate} className="h-1.5 flex-1" />
                    <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                      {course.completionRate}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    {course.rating > 0 ? (
                      <>
                        <StarRating value={course.rating} size={13} />
                        <span className="tabular-nums">{course.rating.toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Ações">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link href={`/cursos/${course.slug}`} />}>
                        <Eye className="size-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem render={<Link href={`/cursos/${course.slug}`} />}>
                        <Pencil className="size-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="size-4" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <Trash2 className="size-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
        <span>
          Exibindo {pageItems.length} de {filtered.length} cursos
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={current <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="px-2 tabular-nums">
            {current} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      </div>
    </Card>
  )
}
