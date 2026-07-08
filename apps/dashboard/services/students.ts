import { api } from "@/lib/api"
import type { Student, StudentStatus } from "@/lib/mock/students"

export interface ApiStudent {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  courses: number
  progress: number
  lastAccessLabel: string
  status: StudentStatus
}

export const getInstructorStudents = async (): Promise<ApiStudent[]> => {
  const { data } = await api.get<ApiStudent[]>("/instructor/students")
  return data
}

export const toStudent = (s: ApiStudent): Student => ({
  id: s.id,
  name: s.name,
  email: s.email,
  avatarUrl: s.avatarUrl,
  status: s.status,
  courses: s.courses,
  progress: s.progress,
  lastAccess: s.lastAccessLabel,
})
