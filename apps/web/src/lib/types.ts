export type Role = 'admin' | 'instrutor' | 'profissional'
export type CourseStatus = 'DRAFT' | 'PUBLISHED'
export type VideoSource = 'MUX' | 'YOUTUBE' | 'VIMEO' | 'NONE'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type ChildRecordType = 'EVOLUCAO' | 'SESSAO' | 'PEI'

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
  videoSource: VideoSource; videoRef: string | null; durationSec: number | null
  attachments: Attachment[]
  video: { source: VideoSource; embedUrl: string | null }
}

export type Enrollment = {
  id: string; userId: string; courseId: string; status: EnrollmentStatus; enrolledAt: string
}
export type EnrollmentListItem = Enrollment & {
  course: { id: string; slug: string; title: string; coverImage: string | null }
  progressCount: number; totalLessons: number
}
export type LessonProgress = { id: string; lessonId: string; completedAt: string; lesson: { id: string; title: string; order: number } }
export type Certificate = { id: string; enrollmentId: string; code: string; issuedAt: string; url: string | null }
export type EnrollmentDetail = Enrollment & {
  progress: LessonProgress[]; certificate: Certificate | null
}

export type Child = { id: string; ownerProfId: string; name: string; birthDate: string | null; diagnosis: string | null; createdAt: string }
export type ChildRecord = { id: string; childId: string; authorId: string; type: ChildRecordType; content: string; date: string }
export type ChildDetail = Child & { records: ChildRecord[] }
