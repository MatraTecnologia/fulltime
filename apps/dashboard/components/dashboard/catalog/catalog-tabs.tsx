"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "@/components/dashboard/catalog/categories-tab"
import { TracksTab } from "@/components/dashboard/catalog/tracks-tab"
import { EventsTab } from "@/components/dashboard/catalog/events-tab"

export const CatalogTabs = () => {
  const [tab, setTab] = React.useState("categories")

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="categories">Categorias</TabsTrigger>
        <TabsTrigger value="tracks">Trilhas</TabsTrigger>
        <TabsTrigger value="events">Eventos</TabsTrigger>
      </TabsList>
      <TabsContent value="categories" className="mt-6">
        <CategoriesTab />
      </TabsContent>
      <TabsContent value="tracks" className="mt-6">
        <TracksTab />
      </TabsContent>
      <TabsContent value="events" className="mt-6">
        <EventsTab />
      </TabsContent>
    </Tabs>
  )
}
