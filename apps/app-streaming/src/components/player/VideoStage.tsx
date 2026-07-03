import MuxPlayer from '@mux/mux-player-react'
import type { Lesson } from '@/lib/types'

interface Props { lesson: Lesson }

export const VideoStage = ({ lesson }: Props) => {
  const { video, title } = lesson
  if (video.source === 'MUX' && video.playbackId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-card bg-black">
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
      <div className="relative aspect-video w-full overflow-hidden rounded-card">
        <iframe src={video.embedUrl} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      </div>
    )
  }
  return <div className="grid aspect-video w-full place-items-center rounded-card bg-brand-navy/10 text-sm text-brand-navy/60">Vídeo indisponível</div>
}
