import { api } from "@/lib/api"

export type VideoAssetStatus = "WAITING_UPLOAD" | "UPLOADING" | "PROCESSING" | "READY" | "ERRORED"

export interface VideoUpload {
  id: string
  uploadUrl: string
}

export interface VideoAsset {
  id: string
  status: VideoAssetStatus
  playbackId: string | null
  filename: string | null
  durationSec: number | null
  error: string | null
  lessonId: string | null
  createdAt: string
  lesson: { id: string; title: string } | null
}

export interface VideoStatus {
  id: string
  status: VideoAssetStatus
  playbackId: string | null
}

export const createVideoUpload = async ({
  lessonId,
  filename,
}: {
  lessonId?: string
  filename: string
}): Promise<VideoUpload> => {
  const { data } = await api.post<VideoUpload>("/admin/videos/uploads", { lessonId, filename })
  return data
}

export const uploadVideoToMux = (
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", uploadUrl)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error("Falha no envio do vídeo."))
    xhr.onerror = () => reject(new Error("Falha no envio do vídeo."))
    xhr.send(file)
  })

export const getVideoStatus = async (id: string): Promise<VideoStatus> => {
  const { data } = await api.get<VideoStatus>(`/admin/videos/${id}`)
  return data
}

export const listVideos = async (): Promise<VideoAsset[]> => {
  const { data } = await api.get<VideoAsset[]>("/admin/videos")
  return data
}

export const deleteVideo = async (id: string): Promise<void> => {
  await api.delete(`/admin/videos/${id}`)
}

export const linkVideoToLesson = async (lessonId: string, videoAssetId: string): Promise<void> => {
  await api.post(`/lessons/${lessonId}/video/link`, { videoAssetId })
}
