'use client'

import MuxPlayer from '@mux/mux-player-react'
import type { VideoSource } from '@/lib/types'

interface VideoEmbedProps {
  url: string | null
  title: string
  source?: VideoSource
  playbackId?: string | null
}

export const VideoEmbed = ({ url, title, source, playbackId }: VideoEmbedProps) => {
  if (source === 'MUX' && playbackId) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <MuxPlayer
          playbackId={playbackId}
          metadata={{ video_title: title }}
          accentColor="#003060"
          className="h-full w-full"
        />
      </div>
    )
  }

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
