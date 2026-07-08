"use client"

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

export const AddContentSheet = () => {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Adicionar conteúdo
          </Button>
        }
      />
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-none data-[side=right]:sm:max-w-2xl">
        <SheetHeader className="border-b p-5">
          <SheetTitle>Adicionar conteúdo</SheetTitle>
          <SheetDescription>Envie uma aula, material ou avaliação para este curso.</SheetDescription>
        </SheetHeader>
        <div className="p-5">
          <ContentForm />
        </div>
      </SheetContent>
    </Sheet>
  )
}
