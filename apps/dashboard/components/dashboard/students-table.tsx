"use client"

import * as React from "react"
import Link from "next/link"
import {
  Award,
  MessageSquare,
  MoreHorizontal,
  Search,
  Trash2,
  UserRound,
  Users,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/dashboard/empty-state"
import { initials } from "@/lib/utils"
import type { Student, StudentStatus } from "@/lib/mock/students"

type TabKey = "all" | StudentStatus

const PAGE_SIZE = 8

const tabsMeta: { key: TabKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Ativos" },
  { key: "completed", label: "Concluíram" },
  { key: "inactive", label: "Inativos" },
]

export const StudentsTable = ({ students }: { students: Student[] }) => {
  const [tab, setTab] = React.useState<TabKey>("all")
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(1)

  const counts = React.useMemo(
    () => ({
      all: students.length,
      active: students.filter((s) => s.status === "active").length,
      completed: students.filter((s) => s.status === "completed").length,
      inactive: students.filter((s) => s.status === "inactive").length,
    }),
    [students]
  )

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return students
      .filter((s) => (tab === "all" ? true : s.status === tab))
      .filter((s) =>
        q
          ? s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
          : true
      )
  }, [students, tab, query])

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

        <div className="relative lg:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar aluno..."
            className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring"
          />
        </div>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum aluno encontrado"
          description="Ajuste a busca ou os filtros para encontrar seus alunos."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Aluno</TableHead>
              <TableHead className="text-center">Cursos</TableHead>
              <TableHead className="w-48">Progresso geral</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead className="pr-4 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {student.avatarUrl && <AvatarImage src={student.avatarUrl} />}
                      <AvatarFallback>{initials(student.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{student.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm tabular-nums">
                  {student.courses} {student.courses === 1 ? "curso" : "cursos"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={student.progress} className="h-1.5 flex-1" />
                    <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                      {student.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {student.lastAccess}
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
                      <DropdownMenuItem render={<Link href={`/alunos/${student.id}`} />}>
                        <UserRound className="size-4" />
                        Ver perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="size-4" />
                        Enviar mensagem
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="size-4" />
                        Ver certificados
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <Trash2 className="size-4" />
                        Remover
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
          Exibindo {pageItems.length} de {filtered.length} alunos
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
