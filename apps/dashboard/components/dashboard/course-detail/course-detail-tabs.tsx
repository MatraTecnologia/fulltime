"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseContentTab } from "@/components/dashboard/course-detail/course-content-tab"
import { CourseDetailsTab } from "@/components/dashboard/course-detail/course-details-tab"
import { CourseSettingsTab } from "@/components/dashboard/course-detail/course-settings-tab"
import type { CourseDetail } from "@/lib/mock/course-detail"

export const CourseDetailTabs = ({ course }: { course: CourseDetail }) => {
  const [tab, setTab] = React.useState("content")

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="content">Conteúdo</TabsTrigger>
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>
      <TabsContent value="content" className="mt-6">
        <CourseContentTab modules={course.modules} />
      </TabsContent>
      <TabsContent value="details" className="mt-6">
        <CourseDetailsTab course={course} />
      </TabsContent>
      <TabsContent value="settings" className="mt-6">
        <CourseSettingsTab />
      </TabsContent>
    </Tabs>
  )
}
