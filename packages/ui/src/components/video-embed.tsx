import { cn } from '../lib/cn.js'

interface VideoEmbedProps {
  url: string | null
  title?: string
  className?: string
}

export const VideoEmbed = ({ url, title = 'Vídeo', className }: VideoEmbedProps) => (
  <div className={cn('relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100', className)}>
    {url ? (
      <iframe
        src={url}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
        Vídeo indisponível
      </div>
    )}
  </div>
)
