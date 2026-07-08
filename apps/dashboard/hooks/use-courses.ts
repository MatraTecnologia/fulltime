"use client"

import { useQuery } from "@tanstack/react-query"
import { getInstructorCourses } from "@/services/courses"

export const useInstructorCourses = () =>
  useQuery({
    queryKey: ["instructor", "courses"],
    queryFn: getInstructorCourses,
  })
