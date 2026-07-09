import { api } from "@/lib/api"

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export const uploadImage = async (file: File): Promise<string> => {
  const dataUrl = await readAsDataUrl(file)
  const { data } = await api.post<{ publicUrl: string }>("/uploads/image", { dataUrl })
  return data.publicUrl
}

export const uploadFile = async (file: File): Promise<string> => {
  const dataUrl = await readAsDataUrl(file)
  const { data } = await api.post<{ publicUrl: string }>("/uploads/file", { dataUrl })
  return data.publicUrl
}
