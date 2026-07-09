import type {
  CertElement,
  CertElementStyle,
  ElementBinding,
  ElementType,
  PageSize,
} from "@/services/certificate-templates"

export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  A4_LANDSCAPE: { width: 297, height: 210 },
  A4_PORTRAIT: { width: 210, height: 297 },
}

export const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  A4_LANDSCAPE: "A4 paisagem",
  A4_PORTRAIT: "A4 retrato",
}

export const FONT_FAMILIES = [
  "Inter",
  "Montserrat",
  "Playfair Display",
  "Lora",
  "Merriweather",
  "Poppins",
  "Great Vibes",
] as const

export const FONT_WEIGHTS: { value: string; label: string }[] = [
  { value: "300", label: "Leve" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Médio" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Negrito" },
]

export const BINDING_LABELS: Record<ElementBinding, string> = {
  studentName: "«Nome do aluno»",
  courseTitle: "«Título do curso»",
  issueDate: "«Data de emissão»",
  code: "«Código»",
  instructorName: "«Instrutor»",
  courseDurationHours: "«Carga horária»",
  verifyUrl: "«URL de verificação»",
}

export const BINDING_OPTIONS: { value: ElementBinding; label: string }[] = [
  { value: "studentName", label: "Nome do aluno" },
  { value: "courseTitle", label: "Título do curso" },
  { value: "issueDate", label: "Data de emissão" },
  { value: "code", label: "Código" },
  { value: "instructorName", label: "Instrutor" },
  { value: "courseDurationHours", label: "Carga horária" },
  { value: "verifyUrl", label: "URL de verificação" },
]

export const PT_TO_MM = 25.4 / 72

export const DEFAULT_STYLE: CertElementStyle = {
  fontFamily: "Inter",
  fontSize: 18,
  fontWeight: "400",
  italic: false,
  color: "#1f2937",
  align: "center",
  verticalAlign: "middle",
  lineHeight: 1.3,
  letterSpacing: 0,
  opacity: 1,
}

export const withStyle = (element: CertElement): CertElementStyle => ({
  ...DEFAULT_STYLE,
  ...element.style,
})

export const resolveBindingText = (text: string): string =>
  text.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (match, key: string) => {
    const label = BINDING_LABELS[key as ElementBinding]
    return label ?? match
  })

export const createElement = (type: ElementType, page: { width: number; height: number }): CertElement => {
  const base: CertElement = {
    id: `el-${Math.random().toString(36).slice(2, 10)}`,
    type,
    x: Math.round(page.width / 2 - 40),
    y: Math.round(page.height / 2 - 10),
    w: 80,
    h: 20,
  }

  if (type === "text") return { ...base, text: "Texto do certificado", style: { ...DEFAULT_STYLE } }
  if (type === "dynamic") return { ...base, binding: "studentName", style: { ...DEFAULT_STYLE, fontSize: 26 } }
  if (type === "qrcode") return { ...base, w: 30, h: 30, binding: "verifyUrl" }
  return { ...base, w: 40, h: 40, src: "" }
}
