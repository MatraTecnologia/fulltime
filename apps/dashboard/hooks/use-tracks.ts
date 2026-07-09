"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/lib/api"
import {
  addTrackCourse,
  createTrack,
  deleteTrack,
  getTrack,
  getTracks,
  removeTrackCourse,
  updateTrack,
  type CreateTrackInput,
  type UpdateTrackInput,
} from "@/services/tracks"

export const useTracks = () =>
  useQuery({
    queryKey: ["tracks"],
    queryFn: getTracks,
  })

export const useTrack = (slug: string) =>
  useQuery({
    queryKey: ["track", slug],
    queryFn: () => getTrack(slug),
    enabled: !!slug,
  })

export const useCreateTrack = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTrackInput) => createTrack(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracks"] })
      toast.success("Trilha criada com sucesso.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useUpdateTrack = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTrackInput }) => updateTrack(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracks"] })
      qc.invalidateQueries({ queryKey: ["track"] })
      toast.success("Alterações salvas.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useDeleteTrack = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTrack(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracks"] })
      toast.success("Trilha excluída.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useAddTrackCourse = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ trackId, courseId, order }: { trackId: string; courseId: string; order?: number }) =>
      addTrackCourse(trackId, courseId, order),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["track", slug] })
      qc.invalidateQueries({ queryKey: ["tracks"] })
      toast.success("Curso adicionado à trilha.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}

export const useRemoveTrackCourse = (slug: string) => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ trackId, courseId }: { trackId: string; courseId: string }) =>
      removeTrackCourse(trackId, courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["track", slug] })
      qc.invalidateQueries({ queryKey: ["tracks"] })
      toast.success("Curso removido da trilha.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
