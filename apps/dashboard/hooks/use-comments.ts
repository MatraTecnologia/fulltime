"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getInstructorComments, replyToComment } from "@/services/comments"
import { getApiErrorMessage } from "@/lib/api"

export const useInstructorComments = () =>
  useQuery({
    queryKey: ["instructor", "comments"],
    queryFn: getInstructorComments,
  })

export const useReplyToComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: replyToComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "comments"] })
      toast.success("Resposta enviada.")
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  })
}
