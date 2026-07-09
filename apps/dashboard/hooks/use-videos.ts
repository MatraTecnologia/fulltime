"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import { deleteVideo, linkVideoToLesson, listVideos } from "@/services/videos"

const isProcessing = (status: string) =>
  status === "WAITING_UPLOAD" || status === "UPLOADING" || status === "PROCESSING"

export const useVideos = () =>
  useQuery({
    queryKey: ["videos"],
    queryFn: listVideos,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((v) => isProcessing(v.status)) ? 4000 : false,
  })

export const useDeleteVideo = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos"] })
      toast.success("Vídeo removido.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useLinkVideo = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, videoAssetId }: { lessonId: string; videoAssetId: string }) =>
      linkVideoToLesson(lessonId, videoAssetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["videos"] })
      qc.invalidateQueries({ queryKey: ["course"] })
      toast.success("Vídeo vinculado à aula.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
