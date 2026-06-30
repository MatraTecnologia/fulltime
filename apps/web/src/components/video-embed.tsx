interface VideoEmbedProps {
  url: string | null
  title: string
}

export const VideoEmbed = ({ url, title }: VideoEmbedProps) => {
  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-brand-navy/10">
        <p className="text-sm text-brand-navy/70">Vídeo indisponível</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}
