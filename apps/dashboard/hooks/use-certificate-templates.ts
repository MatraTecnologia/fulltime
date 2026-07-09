"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getApiErrorMessage } from "@/lib/api"
import {
  cloneTemplate,
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  type CreateTemplateInput,
  type UpdateTemplateInput,
} from "@/services/certificate-templates"

export const useTemplates = () =>
  useQuery({
    queryKey: ["certificate-templates"],
    queryFn: listTemplates,
  })

export const useTemplate = (id: string) =>
  useQuery({
    queryKey: ["certificate-template", id],
    queryFn: () => getTemplate(id),
  })

export const useCreateTemplate = () => {
  const qc = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (input: CreateTemplateInput) => createTemplate(input),
    onSuccess: (template) => {
      qc.invalidateQueries({ queryKey: ["certificate-templates"] })
      toast.success("Modelo criado com sucesso.")
      router.push(`/certificados/templates/${template.id}`)
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useUpdateTemplate = (id: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTemplateInput) => updateTemplate(id, input),
    onSuccess: (template) => {
      qc.setQueryData(["certificate-template", id], template)
      qc.invalidateQueries({ queryKey: ["certificate-templates"] })
      toast.success("Modelo salvo.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteTemplate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate-templates"] })
      toast.success("Modelo excluído.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useCloneTemplate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cloneTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate-templates"] })
      toast.success("Modelo duplicado.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
