export type Role = 'admin' | 'instrutor' | 'profissional'
export type CourseStatus = 'DRAFT' | 'PUBLISHED'
export type VideoSource = 'MUX' | 'YOUTUBE' | 'VIMEO' | 'NONE'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type User = { id: string; name: string; email: string; role: Role; image: string | null }

export type CourseListItem = {
  id: string; slug: string; title: string; description: string | null
  coverImage: string | null; status: CourseStatus; createdAt: string
  instructor: { id: string; name: string }
  _count: { modules: number }
}

export type LessonSummary = { id: string; title: string; order: number; durationSec: number | null }
export type ModuleWithLessons = { id: string; title: string; order: number; lessons: LessonSummary[] }
export type CourseDetail = {
  id: string; slug: string; title: string; description: string | null
  coverImage: string | null; status: CourseStatus
  instructor: { id: string; name: string }
  modules: ModuleWithLessons[]
}

export type Attachment = { id: string; name: string; url: string; type: string | null }
export type Lesson = {
  id: string; moduleId: string; title: string; order: number; content: string | null
  transcript: string | null
  videoSource: VideoSource; videoRef: string | null; durationSec: number | null
  attachments: Attachment[]
  video: { source: VideoSource; embedUrl: string | null; playbackId: string | null; token: string | null }
}

export type Enrollment = { id: string; userId: string; courseId: string; status: EnrollmentStatus; enrolledAt: string }
export type EnrollmentListItem = Enrollment & {
  course: { id: string; slug: string; title: string; coverImage: string | null }
  progressCount: number; totalLessons: number
}
export type LessonProgress = { id: string; lessonId: string; completedAt: string; lesson: { id: string; title: string; order: number } }
export type EnrollmentDetail = Enrollment & { progress: LessonProgress[]; certificate: unknown | null }

export type LessonComment = { id: string; content: string; createdAt: string; author: { id: string; name: string; image: string | null } }
export type LessonRating = { value: number; average: number; count: number }

export type TrackLevel = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO'
export type EventType = 'WEBINAR' | 'LIVE' | 'WORKSHOP'
export type EventStatus = 'DRAFT' | 'PUBLISHED'

export type Category = {
  id: string; slug: string; name: string; description: string | null
  color: string | null; icon: string | null
  _count?: { courses: number }
}
export type CategoryDetail = Category & { courses: CourseListItem[] }

export type TrackListItem = {
  id: string; slug: string; title: string; description: string | null
  coverImage: string | null; color: string | null; icon: string | null
  level: TrackLevel; status: CourseStatus
  _count: { courses: number }
}
export type TrackCourseItem = { order: number; course: CourseListItem }
export type TrackDetail = Omit<TrackListItem, '_count'> & {
  courses: TrackCourseItem[]
  totalHours?: number
}

export type EventListItem = {
  id: string; slug: string; title: string; description: string | null
  type: EventType; status: EventStatus; startsAt: string
  durationMin: number | null; url: string | null; coverImage: string | null
  _count: { registrations: number }
}
export type EventDetail = EventListItem & { registered?: boolean }

export type CertificateItem = {
  id: string; code: string; issuedAt: string; url: string | null
  course: { id: string; slug: string; title: string; coverImage: string | null }
  user?: { id: string; name: string }
}
