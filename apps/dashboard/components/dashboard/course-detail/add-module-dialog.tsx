"use client"

import * as React from "react"
import { FolderPlus } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useCreateModule } from "@/hooks/use-course-detail"

export const AddModuleDialog = ({
  courseId,
  slug,
  order,
}: {
  courseId: string
  slug: string
  order: number
}) => {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const createModule = useCreateModule(slug)

  const handleCreate = () => {
    if (!title.trim()) return
    createModule.mutate(
      { courseId, title: title.trim(), order },
      {
        onSuccess: () => {
          setTitle("")
          setOpen(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <FolderPlus className="size-4" />
            Adicionar módulo
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo módulo</DialogTitle>
          <DialogDescription>Dê um nome ao módulo para organizar as aulas.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="module-title">Título do módulo</Label>
          <Input
            id="module-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Módulo 1 — Fundamentos"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate()
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button onClick={handleCreate} disabled={!title.trim() || createModule.isPending}>
            {createModule.isPending && <Spinner />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
