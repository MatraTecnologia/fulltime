"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMyProfile, updateMyProfile } from "@/services/profile"

export const useMyProfile = () =>
  useQuery({
    queryKey: ["me", "profile"],
    queryFn: getMyProfile,
  })

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "profile"] })
    },
  })
}
