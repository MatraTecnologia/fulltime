"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/services/categories"

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

export const useCreateCategory = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Categoria criada com sucesso.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useUpdateCategory = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) => updateCategory(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Alterações salvas.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteCategory = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
      toast.success("Categoria excluída.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
