import { api } from "@/lib/api"

export interface Category {
  id: string
  slug: string
  name: string
  description: string | null
  color: string | null
  icon: string | null
  _count: { courses: number }
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  description?: string
  color?: string
  icon?: string
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<Category[]>("/categories")
  return data
}

export const createCategory = async (input: CreateCategoryInput): Promise<Category> => {
  const { data } = await api.post<Category>("/categories", input)
  return data
}

export const updateCategory = async (id: string, input: UpdateCategoryInput): Promise<Category> => {
  const { data } = await api.patch<Category>(`/categories/${id}`, input)
  return data
}

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/categories/${id}`)
}
