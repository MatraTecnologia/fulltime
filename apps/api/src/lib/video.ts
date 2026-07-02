import { VideoSource } from '../generated/prisma/client.js'

export type ResolvedVideo = {
  source: VideoSource
  embedUrl: string | null
  playbackId: string | null
  token: string | null
}

export const resolveVideo = (source: VideoSource, ref: string | null): ResolvedVideo => {
  if (source === VideoSource.YOUTUBE && ref)
    return { source, embedUrl: `https://www.youtube.com/embed/${ref}`, playbackId: null, token: null }
  if (source === VideoSource.VIMEO && ref)
    return { source, embedUrl: `https://player.vimeo.com/video/${ref}`, playbackId: null, token: null }
  if (source === VideoSource.MUX && ref)
    return { source, embedUrl: null, playbackId: ref, token: null }
  return { source, embedUrl: null, playbackId: null, token: null }
}
