"use client"

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
import { courseCategories, courseLevels, type CourseDetail } from "@/lib/mock/course-detail"

const asItems = (list: string[]) => Object.fromEntries(list.map((v) => [v, v]))

export const CourseDetailsTab = ({ course }: { course: CourseDetail }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informações do curso</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="detail-title">Título</Label>
          <Input id="detail-title" defaultValue={course.title} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="detail-description">Descrição</Label>
          <Textarea id="detail-description" rows={4} defaultValue={course.description} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Categoria</Label>
            <Select defaultValue={course.category} items={asItems(courseCategories)}>
              <SelectTrigger className="w-full">
                <SelectValue />
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
            <Select defaultValue={course.level} items={asItems(courseLevels)}>
              <SelectTrigger className="w-full">
                <SelectValue />
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
        <div className="flex justify-end border-t pt-4">
          <Button>Salvar alterações</Button>
        </div>
      </CardContent>
    </Card>
  )
}
