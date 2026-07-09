export type Role = 'admin' | 'instrutor' | 'profissional'
export type CourseStatus = 'DRAFT' | 'PUBLISHED'
export type VideoSource = 'MUX' | 'YOUTUBE' | 'VIMEO' | 'NONE'
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

export type User = { id: string; name: string; email: string; role: Role; image: string | null }

export type CourseListItem = {
  id: string; slug: string; title: string; description: string | null
  coverImage: string | null; status: CourseStatus; createdAt: string
  instructor: { id: string; name: string }
  categories?: { id: string; slug: string; name: string }[]
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

export type QuizOptionPublic = { id: string; text: string; order: number }
export type QuizQuestion = { id: string; statement: string; order: number; options: QuizOptionPublic[] }
export type QuizLastAttempt = { score: number; total: number; createdAt: string }
export type Quiz = {
  id: string; lessonId: string; title: string
  questions: QuizQuestion[]
  lastAttempt: QuizLastAttempt | null
}
export type QuizCorrection = { questionId: string; correctOptionId: string | null; chosenOptionId: string | null; correct: boolean }
export type QuizSubmitResult = { score: number; total: number; corrections: QuizCorrection[] }
export type QuizAttempt = { id: string; score: number; total: number; createdAt: string }

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

export type InstructorListItem = {
  id: string; name: string; image: string | null
  area: string | null; coursesCount: number
}

export type CertificateItem = {
  id: string; code: string; issuedAt: string; url: string | null
  course: { id: string; slug: string; title: string; coverImage: string | null }
  user?: { id: string; name: string }
}

export type ExamQuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE' | 'ESSAY'
export type ExamOptionPublic = { id: string; text: string }
export type ExamQuestionPublic = { id: string; type: ExamQuestionType; prompt: string; points: number; options: ExamOptionPublic[] }
export type ExamLastAttempt = { id: string; status: string; score: number | null; passed: boolean | null }
export type ExamPlayer = {
  id: string; title: string; description: string | null
  passingScore: number; maxAttempts: number | null
  questions: ExamQuestionPublic[]
  attemptsUsed: number; passed: boolean; canAttempt: boolean
  lastAttempt: ExamLastAttempt | null
}
export type ExamAnswerInput = { questionId: string; selectedOptionIds?: string[]; essayText?: string }
export type ExamCorrection = { questionId: string; correctOptionIds: string[]; earned: number }
export type ExamAttemptResult = {
  id: string; status: 'GRADED' | 'GRADING'
  autoScore: number; totalPoints: number; score: number | null; passed: boolean | null
  needsGrading: boolean; corrections: ExamCorrection[] | null
}
export type ExamState = 'none' | 'pending' | 'grading' | 'passed' | 'failed'
export type ModuleProgress = {
  id: string; title: string; order: number
  lessonsDone: number; lessonsTotal: number
  exam: { id: string; state: ExamState } | null
  unlocked: boolean; completed: boolean
}
export type CourseProgress = {
  modules: ModuleProgress[]
  finalExam: { id: string; state: ExamState; unlocked: boolean } | null
  courseCompleted: boolean
}

export type PostListItem = {
  id: string; slug: string; title: string; excerpt: string | null; coverImage: string | null
  status: CourseStatus; publishedAt: string | null; createdAt: string
  author: { id: string; name: string; image: string | null }
  categories: { id: string; name: string }[]
}
export type PostDetail = PostListItem & { content: string }
