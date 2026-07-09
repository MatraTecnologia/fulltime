import { api } from "@/lib/api"

export interface ApiCommentReply {
  id: string
  content: string
  timeAgo: string
  author: { name: string; avatarUrl: string | null }
  isInstructor: boolean
}

export interface ApiComment {
  id: string
  lessonId: string
  content: string
  createdAt: string
  timeAgo: string
  student: { name: string; avatarUrl: string | null }
  courseTitle: string
  lessonTitle: string
  replies: ApiCommentReply[]
  replied: boolean
}

export const getInstructorComments = async (): Promise<ApiComment[]> => {
  const { data } = await api.get<ApiComment[]>("/instructor/comments")
  return data
}

export const replyToComment = async ({
  lessonId,
  content,
  parentId,
}: {
  lessonId: string
  content: string
  parentId: string
}) => {
  const { data } = await api.post(`/lessons/${lessonId}/comments`, { content, parentId })
  return data
}
