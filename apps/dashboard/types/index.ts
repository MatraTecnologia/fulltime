export type Role = "admin" | "instrutor" | "profissional"

export type CourseStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED"

export type CertificateStatus = "ISSUED" | "PENDING"

export interface InstructorProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  headline: string
  rating: number
  ratingCount: number
  verified: boolean
}

export interface InstructorStats {
  publishedCourses: number
  totalStudents: number
  positiveRatingRate: number
  contentHours: number
  newStudents: number
  newStudentsDelta: number
  activeStudents: number
  activeStudentsDelta: number
  completionRate: number
  completionRateDelta: number
  earnings: number
  earningsDelta: number
}

export interface CourseSummary {
  id: string
  slug: string
  title: string
  thumbnailUrl: string | null
  status: CourseStatus
  lessons: number
  students: number
  rating: number
  completionRate: number
}

export interface CourseRow extends CourseSummary {
  durationLabel: string
  updatedAtLabel: string
}

export type ClassStatus = "active" | "upcoming" | "finished"

export interface ClassGroup {
  id: string
  name: string
  courseTitle: string
  students: number
  capacity: number
  periodLabel: string
  progress: number
  status: ClassStatus
}

export type ContentKind = "video" | "text" | "download" | "audio" | "quiz"

export interface ActivityItem {
  id: string
  type: "comment" | "enrollment" | "rating" | "certificate"
  title: string
  description: string
  timeAgo: string
}

export interface RatingBucket {
  stars: 1 | 2 | 3 | 4 | 5
  count: number
  percentage: number
}

export interface ChartPoint {
  date: string
  value: number
}

export interface CompletionSlice {
  label: string
  value: number
  color: string
}
