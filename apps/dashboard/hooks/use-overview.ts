"use client"

import { useQuery } from "@tanstack/react-query"
import { getInstructorOverview } from "@/services/overview"

export const useInstructorOverview = () =>
  useQuery({
    queryKey: ["instructor", "overview"],
    queryFn: getInstructorOverview,
  })
