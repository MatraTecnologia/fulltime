"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import {
  getCertificateDetail,
  issueCertificate,
  listEligible,
  listIssued,
  reissueCertificate,
  revokeCertificate,
  saveOverrides,
} from "@/services/certificates"

export const useIssuedCertificates = () =>
  useQuery({
    queryKey: ["certificates", "issued"],
    queryFn: listIssued,
  })

export const useEligibleEnrollments = () =>
  useQuery({
    queryKey: ["certificates", "eligible"],
    queryFn: listEligible,
  })

export const useCertificateDetail = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: ["certificates", "detail", id],
    queryFn: () => getCertificateDetail(id),
    enabled,
  })

export const useIssueCertificate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (enrollmentId: string) => issueCertificate(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificates", "issued"] })
      qc.invalidateQueries({ queryKey: ["certificates", "eligible"] })
      toast.success("Certificado emitido.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useRevokeCertificate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => revokeCertificate(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["certificates", "issued"] })
      qc.invalidateQueries({ queryKey: ["certificates", "detail", id] })
      toast.success("Certificado revogado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useReissueCertificate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => reissueCertificate(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["certificates", "issued"] })
      qc.invalidateQueries({ queryKey: ["certificates", "detail", id] })
      toast.success("Certificado reemitido.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useSaveOverrides = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, overrides }: { id: string; overrides: Record<string, string> }) =>
      saveOverrides(id, overrides),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["certificates", "issued"] })
      qc.invalidateQueries({ queryKey: ["certificates", "detail", id] })
      toast.success("Personalização salva.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
