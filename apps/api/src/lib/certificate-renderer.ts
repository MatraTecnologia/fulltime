import QRCode from 'qrcode'

export type ElementBinding =
  | 'studentName'
  | 'courseTitle'
  | 'issueDate'
  | 'code'
  | 'instructorName'
  | 'courseDurationHours'
  | 'verifyUrl'

export type ElementType = 'text' | 'dynamic' | 'image' | 'qrcode'

export interface CertElementStyle {
  fontFamily: string
  fontSize: number
  fontWeight: number | string
  italic: boolean
  color: string
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'middle' | 'bottom'
  lineHeight: number
  letterSpacing: number
  opacity: number
}

export interface CertElement {
  id: string
  type: ElementType
  x: number
  y: number
  w: number
  h: number
  rotation?: number
  z?: number
  binding?: ElementBinding
  text?: string
  src?: string
  style?: Partial<CertElementStyle>
}

export interface CertTemplate {
  pageSize: 'A4_LANDSCAPE' | 'A4_PORTRAIT'
  background?: string | null
  backgroundColor?: string | null
  elements: CertElement[]
}

export interface CertData {
  studentName: string
  courseTitle: string
  issueDate: string
  code: string
  instructorName: string
  courseDurationHours: string
  verifyUrl: string
}

export const PAGE_SIZES = {
  A4_LANDSCAPE: { width: 297, height: 210 },
  A4_PORTRAIT: { width: 210, height: 297 },
} as const

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap'

const DEFAULT_STYLE: CertElementStyle = {
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 400,
  italic: false,
  color: '#111111',
  align: 'center',
  verticalAlign: 'middle',
  lineHeight: 1.2,
  letterSpacing: 0,
  opacity: 1,
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const num = (value: unknown, fallback = 0): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const safeUrl = (value: string): string => {
  const v = value.trim()
  return /^(https?:|data:image\/)/i.test(v) ? escapeHtml(v) : ''
}

const ALIGN = new Set(['left', 'center', 'right'])
const VALIGN = new Set(['top', 'middle', 'bottom'])

const bindingValue = (binding: ElementBinding, data: CertData) => String(data[binding] ?? '')

const interpolate = (text: string, data: CertData) =>
  text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    key in data ? String(data[key as keyof CertData] ?? '') : ''
  )

const resolveText = (el: CertElement, data: CertData): string => {
  if (el.type === 'dynamic') {
    if (el.binding) return bindingValue(el.binding, data)
    if (el.text) return interpolate(el.text, data)
    return ''
  }
  return el.text ?? ''
}

const alignItems = (v: CertElementStyle['verticalAlign']) =>
  v === 'top' ? 'flex-start' : v === 'bottom' ? 'flex-end' : 'center'

const justify = (a: CertElementStyle['align']) =>
  a === 'left' ? 'flex-start' : a === 'right' ? 'flex-end' : 'center'

const renderElement = async (el: CertElement, data: CertData): Promise<string> => {
  const s = { ...DEFAULT_STYLE, ...(el.style ?? {}) }
  const rotation = num(el.rotation)
  const box =
    `position:absolute;left:${num(el.x)}mm;top:${num(el.y)}mm;width:${num(el.w)}mm;height:${num(el.h)}mm;` +
    `z-index:${num(el.z, 1)};opacity:${num(s.opacity, 1)};` +
    (rotation ? `transform:rotate(${rotation}deg);` : '') +
    'overflow:hidden;box-sizing:border-box;display:flex;'

  if (el.type === 'image') {
    const src = el.src ? safeUrl(el.src) : ''
    if (!src) return ''
    return `<div style="${box}align-items:center;justify-content:center;"><img src="${src}" style="width:100%;height:100%;object-fit:contain;"/></div>`
  }

  if (el.type === 'qrcode') {
    const content = el.binding ? bindingValue(el.binding, data) : el.text ?? ''
    if (!content) return ''
    const dataUrl = await QRCode.toDataURL(content, { margin: 0, width: 400 })
    return `<div style="${box}align-items:center;justify-content:center;"><img src="${dataUrl}" style="width:100%;height:100%;object-fit:contain;"/></div>`
  }

  const value = escapeHtml(resolveText(el, data)).replace(/\n/g, '<br/>')
  const align = ALIGN.has(s.align) ? s.align : 'center'
  const valign = VALIGN.has(s.verticalAlign) ? s.verticalAlign : 'middle'
  const textCss =
    `align-items:${alignItems(valign)};justify-content:${justify(align)};text-align:${align};` +
    `font-family:'${escapeHtml(String(s.fontFamily))}',sans-serif;font-size:${num(s.fontSize, 16)}pt;` +
    `font-weight:${escapeHtml(String(s.fontWeight))};font-style:${s.italic ? 'italic' : 'normal'};` +
    `color:${escapeHtml(String(s.color))};line-height:${num(s.lineHeight, 1.2)};` +
    `letter-spacing:${num(s.letterSpacing)}px;white-space:pre-wrap;word-break:break-word;`
  return `<div style="${box}${textCss}"><span>${value}</span></div>`
}

export const renderToHtml = async (template: CertTemplate, data: CertData): Promise<string> => {
  const size = PAGE_SIZES[template.pageSize] ?? PAGE_SIZES.A4_LANDSCAPE
  const bgUrl = template.background ? safeUrl(template.background) : ''
  const bg = bgUrl
    ? `background-image:url('${bgUrl}');background-size:cover;background-position:center;`
    : `background-color:${escapeHtml(String(template.backgroundColor ?? '#ffffff'))};`

  const elements = [...template.elements].sort((a, b) => (a.z ?? 1) - (b.z ?? 1))
  const rendered = (await Promise.all(elements.map((el) => renderElement(el, data)))).join('')

  return `<!doctype html><html><head><meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="${FONTS_HREF}"/>
<style>
  @page { size: ${size.width}mm ${size.height}mm; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size.width}mm; height: ${size.height}mm; }
  .page { position: relative; width: ${size.width}mm; height: ${size.height}mm; overflow: hidden; ${bg} }
</style></head>
<body><div class="page">${rendered}</div></body></html>`
}
