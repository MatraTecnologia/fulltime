import { apiFetch } from '@/lib/api'

type PresignResponse = { uploadUrl: string; publicUrl: string }

export const uploadCoverImage = async (file: File): Promise<string> => {
  const { uploadUrl, publicUrl } = await apiFetch<PresignResponse>('/admin/uploads/cover', {
    method: 'POST',
    body: JSON.stringify({ contentType: file.type, filename: file.name }),
  })

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new Error('Falha ao enviar a imagem.')

  return publicUrl
}
