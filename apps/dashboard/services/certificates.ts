import { api } from "@/lib/api"

export type CertificateStatus = "ISSUED" | "REVOKED"

export interface IssuedCertificate {
  id: string
  code: string
  issuedAt: string
  status: CertificateStatus
  student: { id: string; name: string }
  course: { id: string; title: string; slug: string }
  hasOverrides: boolean
}

export interface EligibleEnrollment {
  enrollmentId: string
  student: { id: string; name: string }
  course: { id: string; title: string }
}

export interface CertificateDetail {
  id: string
  code: string
  status: CertificateStatus
  issuedAt: string
  overrides: Record<string, string>
  student: { name: string }
  course: { title: string }
  templateId: string
}

export const listIssued = async (): Promise<IssuedCertificate[]> => {
  const { data } = await api.get<IssuedCertificate[]>("/certificates/manage/list")
  return data
}

export const listEligible = async (): Promise<EligibleEnrollment[]> => {
  const { data } = await api.get<EligibleEnrollment[]>("/certificates/manage/eligible")
  return data
}

export const issueCertificate = async (enrollmentId: string): Promise<IssuedCertificate> => {
  const { data } = await api.post<IssuedCertificate>("/certificates/manage/issue", { enrollmentId })
  return data
}

export const revokeCertificate = async (id: string): Promise<{ status: CertificateStatus }> => {
  const { data } = await api.post<{ status: CertificateStatus }>(`/certificates/${id}/revoke`)
  return data
}

export const reissueCertificate = async (
  id: string
): Promise<{ status: CertificateStatus; issuedAt: string }> => {
  const { data } = await api.post<{ status: CertificateStatus; issuedAt: string }>(
    `/certificates/${id}/reissue`
  )
  return data
}

export const getCertificateDetail = async (id: string): Promise<CertificateDetail> => {
  const { data } = await api.get<CertificateDetail>(`/certificates/manage/${id}`)
  return data
}

export const saveOverrides = async (
  id: string,
  overrides: Record<string, string>
): Promise<CertificateDetail> => {
  const { data } = await api.patch<CertificateDetail>(`/certificates/${id}/overrides`, { overrides })
  return data
}

export const certificatePdfUrl = (code: string) =>
  `${api.defaults.baseURL}/certificates/${code}/pdf`

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export const formatCertificateDate = (iso: string) => dateFormatter.format(new Date(iso))
