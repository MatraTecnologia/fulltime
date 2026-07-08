import { prisma } from './prisma.js'

const DAY = 24 * 60 * 60 * 1000

const formatDuration = (totalSec: number) => {
  const h = Math.floor(totalSec / 3600)
  const m = Math.round((totalSec % 3600) / 60)
  if (h === 0 && m === 0) return '—'
  return `${h}h ${String(m).padStart(2, '0')}m`
}

const pctDelta = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

const ddmm = (date: Date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`

const relativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  if (d < 7) return `há ${d} d`
  const w = Math.floor(d / 7)
  return `há ${w} sem`
}

const lastAccessLabel = (date: Date) => {
  const d = Math.floor((Date.now() - date.getTime()) / DAY)
  if (d < 7) return relativeTime(date)
  return date.toLocaleDateString('pt-BR')
}

const getScope = async (userId: string) => {
  const courses = await prisma.course.findMany({
    where: { instructorId: userId },
    select: {
      id: true,
      status: true,
      modules: { select: { lessons: { select: { id: true, durationSec: true } } } },
    },
  })
  const courseIds = courses.map((c) => c.id)
  const lessons = courses.flatMap((c) => c.modules.flatMap((m) => m.lessons))
  const lessonIds = lessons.map((l) => l.id)
  const totalDurationSec = lessons.reduce((sum, l) => sum + (l.durationSec ?? 0), 0)
  const lessonsByCourse = new Map(
    courses.map((c) => [c.id, c.modules.reduce((sum, m) => sum + m.lessons.length, 0)])
  )
  return { courses, courseIds, lessonIds, totalDurationSec, lessonsByCourse }
}

export const getInstructorCourses = async (userId: string) => {
  const courses = await prisma.course.findMany({
    where: { instructorId: userId },
    include: {
      categories: { select: { id: true, slug: true, name: true } },
      modules: { include: { lessons: { select: { id: true, durationSec: true } } } },
      enrollments: { select: { status: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return Promise.all(
    courses.map(async (course) => {
      const lessons = course.modules.flatMap((m) => m.lessons)
      const durationSec = lessons.reduce((sum, l) => sum + (l.durationSec ?? 0), 0)
      const students = course.enrollments.length
      const completed = course.enrollments.filter((e) => e.status === 'COMPLETED').length
      const ratingAgg = await prisma.lessonRating.aggregate({
        _avg: { value: true },
        where: { lesson: { module: { courseId: course.id } } },
      })

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        coverImage: course.coverImage,
        status: course.status,
        lessons: lessons.length,
        students,
        completionRate: students ? Math.round((completed / students) * 100) : 0,
        rating: ratingAgg._avg.value ? Number(ratingAgg._avg.value.toFixed(1)) : 0,
        durationLabel: formatDuration(durationSec),
        updatedAt: course.updatedAt,
        categories: course.categories,
      }
    })
  )
}

const buildActivity = async (courseIds: string[], lessonIds: string[]) => {
  const [comments, enrollments, ratings, certificates] = await Promise.all([
    prisma.lessonComment.findMany({
      where: { lesson: { module: { courseId: { in: courseIds } } } },
      select: {
        id: true,
        createdAt: true,
        user: { select: { name: true } },
        lesson: { select: { module: { select: { course: { select: { title: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, enrolledAt: true, user: { select: { name: true } }, course: { select: { title: true } } },
      orderBy: { enrolledAt: 'desc' },
      take: 4,
    }),
    prisma.lessonRating.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { id: true, value: true, createdAt: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    prisma.certificate.findMany({
      where: { enrollment: { courseId: { in: courseIds } } },
      select: {
        id: true,
        issuedAt: true,
        enrollment: { select: { user: { select: { name: true } }, course: { select: { title: true } } } },
      },
      orderBy: { issuedAt: 'desc' },
      take: 4,
    }),
  ])

  const items = [
    ...comments.map((c) => ({
      id: `c_${c.id}`,
      type: 'comment' as const,
      title: 'Novo comentário no curso',
      description: `${c.user.name} comentou em "${c.lesson.module.course.title}"`,
      date: c.createdAt,
    })),
    ...enrollments.map((e) => ({
      id: `e_${e.id}`,
      type: 'enrollment' as const,
      title: 'Novo aluno inscrito',
      description: `${e.user.name} entrou em "${e.course.title}"`,
      date: e.enrolledAt,
    })),
    ...ratings.map((r) => ({
      id: `r_${r.id}`,
      type: 'rating' as const,
      title: 'Avaliação recebida',
      description: `${r.user.name} avaliou com ${r.value} ${r.value === 1 ? 'estrela' : 'estrelas'}`,
      date: r.createdAt,
    })),
    ...certificates.map((cert) => ({
      id: `t_${cert.id}`,
      type: 'certificate' as const,
      title: 'Certificado emitido',
      description: `${cert.enrollment.user.name} concluiu "${cert.enrollment.course.title}"`,
      date: cert.issuedAt,
    })),
  ]

  return items
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6)
    .map(({ date, ...rest }) => ({ ...rest, timeAgo: relativeTime(date) }))
}

export const getInstructorOverview = async (userId: string) => {
  const { courses, courseIds, lessonIds, totalDurationSec } = await getScope(userId)
  const publishedCourses = courses.filter((c) => c.status === 'PUBLISHED').length

  const [enrollments, progress, ratings, certificates] = await Promise.all([
    prisma.enrollment.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true, userId: true, status: true, enrolledAt: true },
    }),
    prisma.lessonProgress.findMany({
      where: { enrollment: { courseId: { in: courseIds } } },
      select: { enrollmentId: true, completedAt: true, enrollment: { select: { userId: true } } },
    }),
    prisma.lessonRating.findMany({ where: { lessonId: { in: lessonIds } }, select: { value: true } }),
    prisma.certificate.findMany({
      where: { enrollment: { courseId: { in: courseIds } } },
      select: { issuedAt: true },
    }),
  ])

  const totalEnrollments = enrollments.length
  const totalStudents = new Set(enrollments.map((e) => e.userId)).size
  const completed = enrollments.filter((e) => e.status === 'COMPLETED').length
  const completionRate = totalEnrollments ? Math.round((completed / totalEnrollments) * 100) : 0

  const now = Date.now()
  const in30 = new Date(now - 30 * DAY)
  const in60 = new Date(now - 60 * DAY)
  const newStudents = enrollments.filter((e) => e.enrolledAt >= in30).length
  const prevNew = enrollments.filter((e) => e.enrolledAt >= in60 && e.enrolledAt < in30).length

  const activeUsers = new Set(progress.filter((p) => p.completedAt >= in30).map((p) => p.enrollment.userId))
  const prevActiveUsers = new Set(
    progress.filter((p) => p.completedAt >= in60 && p.completedAt < in30).map((p) => p.enrollment.userId)
  )

  const enrollmentsWithProgress = new Set(progress.map((p) => p.enrollmentId))
  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE')
  const inProgress = activeEnrollments.filter((e) => enrollmentsWithProgress.has(e.id)).length
  const notStarted = activeEnrollments.length - inProgress
  const breakdownTotal = totalEnrollments || 1

  const ratingCount = ratings.length
  const ratingAvg = ratingCount ? ratings.reduce((s, r) => s + r.value, 0) / ratingCount : 0
  const buckets = [5, 4, 3, 2, 1].map((stars) => {
    const count = ratings.filter((r) => r.value === stars).length
    return { stars, count, percentage: ratingCount ? Math.round((count / ratingCount) * 100) : 0 }
  })
  const positiveRatingRate = ratingCount
    ? Math.round((ratings.filter((r) => r.value >= 4).length / ratingCount) * 100)
    : 0

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const startOfPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  const certThisMonth = certificates.filter((c) => c.issuedAt >= startOfMonth).length
  const certPrevMonth = certificates.filter((c) => c.issuedAt >= startOfPrevMonth && c.issuedAt < startOfMonth).length

  const studentsGrowth = Array.from({ length: 6 }).map((_, i) => {
    const idx = 5 - i
    const start = new Date(now - (idx + 1) * 7 * DAY)
    const end = new Date(now - idx * 7 * DAY)
    const value = enrollments.filter((e) => e.enrolledAt >= start && e.enrolledAt < end).length
    return { date: ddmm(end), value }
  })

  const recentActivity = await buildActivity(courseIds, lessonIds)

  return {
    stats: {
      publishedCourses,
      totalStudents,
      positiveRatingRate,
      contentHours: Math.round(totalDurationSec / 3600),
      newStudents,
      newStudentsDelta: pctDelta(newStudents, prevNew),
      activeStudents: activeUsers.size,
      activeStudentsDelta: pctDelta(activeUsers.size, prevActiveUsers.size),
      completionRate,
      completionRateDelta: 0,
      earnings: 0,
      earningsDelta: 0,
    },
    rating: { average: Number(ratingAvg.toFixed(1)), total: ratingCount, buckets },
    completionBreakdown: [
      { label: 'Concluíram', value: Math.round((completed / breakdownTotal) * 100), color: 'var(--chart-1)' },
      { label: 'Em andamento', value: Math.round((inProgress / breakdownTotal) * 100), color: 'var(--chart-2)' },
      { label: 'Não iniciaram', value: Math.round((notStarted / breakdownTotal) * 100), color: 'var(--chart-4)' },
    ],
    certificates: {
      total: certificates.length,
      deltaMonth: certThisMonth,
      deltaPercentage: pctDelta(certThisMonth, certPrevMonth),
    },
    studentsGrowth,
    earningsSeries: [],
    recentActivity,
  }
}

export const getInstructorStudents = async (userId: string) => {
  const { courseIds, lessonsByCourse } = await getScope(userId)

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    select: {
      courseId: true,
      status: true,
      enrolledAt: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { progress: true } },
      progress: { select: { completedAt: true }, orderBy: { completedAt: 'desc' }, take: 1 },
    },
  })

  type Acc = {
    id: string
    name: string
    email: string
    image: string | null
    courses: number
    progressSum: number
    lastAccess: Date
    allCompleted: boolean
  }
  const byUser = new Map<string, Acc>()

  for (const e of enrollments) {
    const lessonsCount = lessonsByCourse.get(e.courseId) ?? 0
    const pct = lessonsCount ? Math.min(100, Math.round((e._count.progress / lessonsCount) * 100)) : 0
    const lastAccess = e.progress[0]?.completedAt ?? e.enrolledAt
    const existing = byUser.get(e.user.id)
    if (existing) {
      existing.courses += 1
      existing.progressSum += pct
      existing.allCompleted = existing.allCompleted && e.status === 'COMPLETED'
      if (lastAccess > existing.lastAccess) existing.lastAccess = lastAccess
    } else {
      byUser.set(e.user.id, {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
        image: e.user.image,
        courses: 1,
        progressSum: pct,
        lastAccess,
        allCompleted: e.status === 'COMPLETED',
      })
    }
  }

  const now = Date.now()
  return Array.from(byUser.values())
    .map((u) => {
      const progress = Math.round(u.progressSum / u.courses)
      const inactive = now - u.lastAccess.getTime() > 30 * DAY
      const status = u.allCompleted ? 'completed' : inactive ? 'inactive' : 'active'
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.image,
        courses: u.courses,
        progress,
        lastAccessLabel: lastAccessLabel(u.lastAccess),
        status,
      }
    })
    .sort((a, b) => b.progress - a.progress)
}
