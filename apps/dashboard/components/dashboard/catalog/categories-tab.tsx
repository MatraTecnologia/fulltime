"use client"

import * as React from "react"
import { Pencil, Plus, Tags, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/dashboard/empty-state"
import { ConfirmDelete } from "@/components/dashboard/course-detail/confirm-delete"
import { CategoryFormDialog } from "@/components/dashboard/catalog/category-form-dialog"
import { FluentEmoji } from "@/components/dashboard/catalog/fluent-emoji"
import { useCategories, useDeleteCategory } from "@/hooks/use-categories"
import type { Category } from "@/services/categories"

export const CategoriesTab = () => {
  const { data: categories, isLoading } = useCategories()
  const deleteCategory = useDeleteCategory()

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Category | null>(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (category: Category) => {
    setEditing(category)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Organize os cursos do catálogo por categoria.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria ainda"
          description="Crie a primeira categoria para começar a organizar o catálogo."
          action={
            <Button onClick={openCreate} className="gap-1.5">
              <Plus className="size-4" />
              Nova categoria
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Cursos</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <span
                      className="block size-4 rounded-full border"
                      style={{ backgroundColor: category.color ?? "transparent" }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {category.icon && <FluentEmoji char={category.icon} size={20} />}
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {category._count.courses}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        aria-label="Editar categoria"
                        onClick={() => openEdit(category)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground"
                            aria-label="Excluir categoria"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        }
                        title="Excluir categoria"
                        description="Esta ação não pode ser desfeita. Categorias com cursos vinculados podem não ser excluídas."
                        loading={deleteCategory.isPending}
                        onConfirm={() => deleteCategory.mutate(category.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <CategoryFormDialog
        key={editing?.id ?? "new"}
        category={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  )
}
