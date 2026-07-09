import Link from "next/link"
import { Palette } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { CertificatesConnected } from "@/components/dashboard/certificates-connected"

const CertificatesPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Certificados"
        description="Acompanhe os certificados emitidos e personalize os modelos dos seus cursos."
      >
        <Button
          variant="outline"
          className="gap-1.5"
          nativeButton={false}
          render={<Link href="/certificados/templates" />}
        >
          <Palette className="size-4" />
          Modelos de certificado
        </Button>
      </PageHeader>

      <CertificatesConnected />
    </div>
  )
}

export default CertificatesPage
