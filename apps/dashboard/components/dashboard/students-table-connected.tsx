"use client"

import { useInstructorStudents } from "@/hooks/use-students"
import { toStudent } from "@/services/students"
import { getApiErrorMessage } from "@/lib/api"
import { StudentsTable } from "@/components/dashboard/students-table"
import { CoursesTableSkeleton } from "@/components/dashboard/skeletons/courses-table-skeleton"
import { QueryError } from "@/components/dashboard/query-error"

export const StudentsTableConnected = () => {
  const { data, isPending, isError, error, refetch } = useInstructorStudents()

  if (isPending) return <CoursesTableSkeleton rows={8} />
  if (isError) return <QueryError message={getApiErrorMessage(error)} onRetry={() => refetch()} />

  return <StudentsTable students={data.map(toStudent)} />
}
