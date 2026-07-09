import { PageHeader } from "@/components/dashboard/page-header"
import { VideosConnected } from "@/components/dashboard/videos/videos-connected"

const VideosPage = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        title="Vídeos"
        description="Envie vídeos, acompanhe o processamento na fila e vincule os prontos às aulas."
      />

      <VideosConnected />
    </div>
  )
}

export default VideosPage
