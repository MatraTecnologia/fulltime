const resolveEndpoint = (): string => {
  const raw = process.env.BROWSERLESS_WS_ENDPOINT
  if (!raw) throw new Error('BROWSERLESS_WS_ENDPOINT não configurado.')
  const url = new URL(raw)
  const token = url.searchParams.get('token') ?? ''
  return `https://${url.host}/pdf${token ? `?token=${token}` : ''}`
}

export const htmlToPdf = async (
  html: string,
  pageSize: 'A4_LANDSCAPE' | 'A4_PORTRAIT' = 'A4_LANDSCAPE'
): Promise<Buffer> => {
  const response = await fetch(resolveEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html,
      options: {
        format: 'A4',
        landscape: pageSize === 'A4_LANDSCAPE',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Falha ao gerar PDF (browserless ${response.status}). ${detail}`.trim())
  }

  return Buffer.from(await response.arrayBuffer())
}
