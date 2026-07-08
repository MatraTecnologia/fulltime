"use client"

import * as React from "react"
import { GraduationCap } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassCard } from "@/components/dashboard/class-card"
import { EmptyState } from "@/components/dashboard/empty-state"
import type { ClassGroup, ClassStatus } from "@/types"

type Filter = "all" | ClassStatus

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "upcoming", label: "Próximas" },
  { key: "finished", label: "Concluídas" },
]

export const ClassesBoard = ({ groups }: { groups: ClassGroup[] }) => {
  const [filter, setFilter] = React.useState<Filter>("all")

  const visible = filter === "all" ? groups : groups.filter((g) => g.status === filter)

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          {filters.map((f) => (
            <TabsTrigger key={f.key} value={f.key}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhuma turma nesta categoria"
          description="Crie uma nova turma para organizar seus alunos por período."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((group) => (
            <ClassCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
