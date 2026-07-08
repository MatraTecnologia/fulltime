"use client"

import { useInstructorCourses } from "@/hooks/use-courses"
import { toCourseRow } from "@/services/courses"
import { getApiErrorMessage } from "@/lib/api"
import { CoursesTable } from "@/components/dashboard/courses-table"
import { CoursesTableSkeleton } from "@/components/dashboard/skeletons/courses-table-skeleton"
import { QueryError } from "@/components/dashboard/query-error"

export const CoursesTableConnected = () => {
  const { data, isPending, isError, error, refetch } = useInstructorCourses()

  if (isPending) return <CoursesTableSkeleton />
  if (isError) return <QueryError message={getApiErrorMessage(error)} onRetry={() => refetch()} />

  return <CoursesTable courses={data.map(toCourseRow)} />
}
