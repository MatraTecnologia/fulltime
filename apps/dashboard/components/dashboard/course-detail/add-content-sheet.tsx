"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ContentForm } from "@/components/dashboard/content-form"
import type { CourseModuleNode } from "@/services/courses-detail"

export const AddContentSheet = ({ modules, slug }: { modules: CourseModuleNode[]; slug: string }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="gap-1.5" disabled={modules.length === 0}>
            <Plus className="size-4" />
            Adicionar conteúdo
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-none data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle>Adicionar conteúdo</SheetTitle>
          <SheetDescription>Cadastre uma nova aula neste curso.</SheetDescription>
        </SheetHeader>
        <div className="p-5">
          <ContentForm modules={modules} slug={slug} onCreated={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
