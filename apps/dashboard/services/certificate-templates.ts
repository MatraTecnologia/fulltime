import { api } from "@/lib/api"

export type ElementBinding =
  | "studentName"
  | "courseTitle"
  | "issueDate"
  | "code"
  | "instructorName"
  | "courseDurationHours"
  | "verifyUrl"

export type ElementType = "text" | "dynamic" | "image" | "qrcode"

export interface CertElementStyle {
  fontFamily: string
  fontSize: number
  fontWeight: number | string
  italic: boolean
  color: string
  align: "left" | "center" | "right"
  verticalAlign: "top" | "middle" | "bottom"
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

export type PageSize = "A4_LANDSCAPE" | "A4_PORTRAIT"

export interface CertificateTemplate {
  id: string
  name: string
  pageSize: PageSize
  background: string | null
  backgroundColor: string | null
  elements: CertElement[]
  isDefault: boolean
  createdAt: string
  coursesCount?: number
}

export interface CreateTemplateInput {
  name: string
  pageSize?: PageSize
  background?: string | null
  backgroundColor?: string | null
  elements?: CertElement[]
}

export interface UpdateTemplateInput {
  name?: string
  pageSize?: PageSize
  background?: string | null
  backgroundColor?: string | null
  elements?: CertElement[]
  isDefault?: boolean
}

export interface PreviewTemplateInput {
  pageSize: PageSize
  background: string | null
  backgroundColor: string | null
  elements: CertElement[]
}

export const listTemplates = async (): Promise<CertificateTemplate[]> => {
  const { data } = await api.get<CertificateTemplate[]>("/certificate-templates")
  return data
}

export const getTemplate = async (id: string): Promise<CertificateTemplate> => {
  const { data } = await api.get<CertificateTemplate>(`/certificate-templates/${id}`)
  return data
}

export const createTemplate = async (input: CreateTemplateInput): Promise<CertificateTemplate> => {
  const { data } = await api.post<CertificateTemplate>("/certificate-templates", input)
  return data
}

export const updateTemplate = async (
  id: string,
  input: UpdateTemplateInput
): Promise<CertificateTemplate> => {
  const { data } = await api.patch<CertificateTemplate>(`/certificate-templates/${id}`, input)
  return data
}

export const deleteTemplate = async (id: string): Promise<void> => {
  await api.delete(`/certificate-templates/${id}`)
}

export const cloneTemplate = async (id: string): Promise<CertificateTemplate> => {
  const { data } = await api.post<CertificateTemplate>(`/certificate-templates/${id}/clone`)
  return data
}

export const previewTemplate = async (input: PreviewTemplateInput): Promise<{ html: string }> => {
  const { data } = await api.post<{ html: string }>("/certificate-templates/preview", input)
  return data
}
