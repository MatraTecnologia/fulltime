"use client"

import { useQuery } from "@tanstack/react-query"
import { getInstructorStudents } from "@/services/students"

export const useInstructorStudents = () =>
  useQuery({
    queryKey: ["instructor", "students"],
    queryFn: getInstructorStudents,
  })
