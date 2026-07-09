"use client"

import * as React from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EmojiPicker } from "@/components/dashboard/catalog/emoji-picker"
import { Spinner } from "@/components/ui/spinner"
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories"
import type { Category } from "@/services/categories"

export const CategoryFormDialog = ({
  category,
  open,
  onOpenChange,
}: {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const [name, setName] = React.useState(category?.name ?? "")
  const [slug, setSlug] = React.useState(category?.slug ?? "")
  const [description, setDescription] = React.useState(category?.description ?? "")
  const [color, setColor] = React.useState(category?.color ?? "")
  const [icon, setIcon] = React.useState(category?.icon ?? "")

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const isEditing = !!category
  const pending = createCategory.isPending || updateCategory.isPending

  const handleSubmit = () => {
    if (!name.trim() || pending) return

    const input = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      color: color.trim() || undefined,
      icon: icon.trim() || undefined,
    }

    if (isEditing) {
      updateCategory.mutate(
        { id: category.id, input },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createCategory.mutate(input, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da categoria."
              : "Crie uma categoria para organizar os cursos do catálogo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Alfabetização"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-slug">Slug (opcional)</Label>
            <Input
              id="category-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Gerado automaticamente a partir do nome"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-description">Descrição (opcional)</Label>
            <Textarea
              id="category-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o tipo de conteúdo desta categoria..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category-color">Cor (opcional)</Label>
              <div className="flex items-center gap-2">
                <input
                  aria-label="Selecionar cor"
                  type="color"
                  value={color || "#6366f1"}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
                />
                <Input
                  id="category-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Ícone (opcional)</Label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={handleSubmit} disabled={!name.trim() || pending} className="gap-1.5">
            {pending && <Spinner />}
            {isEditing ? "Salvar" : "Criar categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
