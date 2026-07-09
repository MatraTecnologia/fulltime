export type EmbedSource = "YOUTUBE" | "VIMEO"

const YOUTUBE_PATTERNS = [
  /youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
]

const VIMEO_PATTERNS = [
  /player\.vimeo\.com\/video\/(\d+)/,
  /vimeo\.com\/(\d+)/,
]

export const extractEmbedId = (source: EmbedSource, input: string): string | null => {
  const value = input.trim()
  if (!value) return null

  if (source === "YOUTUBE") {
    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value
    for (const pattern of YOUTUBE_PATTERNS) {
      const match = pattern.exec(value)
      if (match) return match[1]
    }
    return null
  }

  if (/^\d+$/.test(value)) return value
  for (const pattern of VIMEO_PATTERNS) {
    const match = pattern.exec(value)
    if (match) return match[1]
  }
  return null
}
