export const safeHref = (url: string): string | undefined => {
  try {
    const { protocol } = new URL(url, 'http://_')
    return protocol === 'http:' || protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}
