import { PageHeader } from "@/components/dashboard/page-header"
import { CatalogTabs } from "@/components/dashboard/catalog/catalog-tabs"

const CatalogPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Catálogo"
        description="Gerencie as categorias, trilhas e eventos exibidos no site."
      />

      <CatalogTabs />
    </div>
  )
}

export default CatalogPage
