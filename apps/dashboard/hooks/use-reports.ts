"use client"

import { useQuery } from "@tanstack/react-query"
import { getInstructorReports } from "@/services/reports"

export const useInstructorReports = () =>
  useQuery({
    queryKey: ["instructor", "reports"],
    queryFn: getInstructorReports,
  })
