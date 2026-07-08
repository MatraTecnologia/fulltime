import { Palette } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { CertificatesPanel } from "@/components/dashboard/certificates-panel"
import { issuedCertificates } from "@/lib/mock/certificates"

const CertificatesPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Certificados"
        description="Acompanhe os certificados emitidos e personalize os modelos dos seus cursos."
      >
        <Button variant="outline" className="gap-1.5">
          <Palette className="size-4" />
          Personalizar certificado
        </Button>
      </PageHeader>

      <CertificatesPanel certificates={issuedCertificates} />
    </div>
  )
}

export default CertificatesPage
