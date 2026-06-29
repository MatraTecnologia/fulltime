import { VideoSource } from '@prisma/client'

export const resolveVideo = (
  source: VideoSource,
  ref: string | null,
): { source: VideoSource; embedUrl: string | null } => {
  if (source === VideoSource.YOUTUBE && ref) return { source, embedUrl: `https://www.youtube.com/embed/${ref}` }
  if (source === VideoSource.VIMEO && ref) return { source, embedUrl: `https://player.vimeo.com/video/${ref}` }
  return { source, embedUrl: null }
}
