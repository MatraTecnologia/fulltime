import MuxPlayer from '@mux/mux-player-react'
import type { Lesson } from '@/lib/types'

interface Props { lesson: Lesson }

export const VideoStage = ({ lesson }: Props) => {
  const { video, title } = lesson
  if (video.source === 'MUX' && video.playbackId) {
    return (
      <div className="aspect-video w-full bg-black">
        <MuxPlayer
          playbackId={video.playbackId}
          tokens={video.token ? { playback: video.token } : undefined}
          metadata={{ video_title: title }}
          accentColor="#032e5b"
          className="h-full w-full"
        />
      </div>
    )
  }
  if (video.embedUrl) {
    return (
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={video.embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }
  return (
    <div className="grid aspect-video w-full place-items-center bg-brand-navy text-sm text-white/50">
      Vídeo indisponível
    </div>
  )
}
