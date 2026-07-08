"use client"

import Link from "next/link"
import { ImagePlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { courseCategories, courseLevels } from "@/lib/mock/course-detail"

const asItems = (list: string[]) => Object.fromEntries(list.map((v) => [v, v]))

export const NewCourseForm = () => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do curso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course-title">Título do curso</Label>
              <Input id="course-title" placeholder="Ex: Alfabetização Adaptada: Por Onde Começar" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-subtitle">Subtítulo</Label>
              <Input id="course-subtitle" placeholder="Uma frase que resume a proposta do curso" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">Descrição</Label>
              <Textarea
                id="course-description"
                rows={5}
                placeholder="Descreva os objetivos, o público-alvo e o que o aluno será capaz de fazer ao concluir..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select items={asItems(courseCategories)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseCategories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nível</Label>
                <Select items={asItems(courseLevels)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseLevels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="text-base">Capa do curso</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <button className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30">
              <ImagePlus className="mb-1 size-7" />
              <span className="text-xs">Enviar imagem de capa</span>
              <span className="text-[0.7rem] text-muted-foreground/70">JPG ou PNG · 1280×720</span>
            </button>
            <div className="grid gap-2">
              <Label htmlFor="course-price">Preço (R$)</Label>
              <Input id="course-price" placeholder="0,00" inputMode="decimal" />
            </div>
            <div className="mt-1 flex flex-col gap-2 border-t pt-4">
              <Button className="w-full">Criar curso</Button>
              <Button variant="outline" className="w-full" nativeButton={false} render={<Link href="/cursos" />}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
