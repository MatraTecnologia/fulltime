import type { FastifyInstance } from 'fastify'
import { CourseStatus, EnrollmentStatus } from '../../generated/prisma/client.js'
import { prisma } from '../../lib/prisma.js'
import { requireAuth, requireRole } from '../../lib/session.js'

const bucketByMonth = (dates: Date[]): { month: string; count: number }[] => {
  const counts = new Map<string, number>()
  for (const date of dates) {
    const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
    counts.set(month, (counts.get(month) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export default async function adminRoutes(app: FastifyInstance) {
  app.get('/admin/metrics', {
    preHandler: [requireAuth, requireRole('admin')],
    schema: {
      tags: ['admin'],
      summary: 'Métricas agregadas do negócio',
    },
  }, async () => {
    const [
      usersByRoleRaw,
      usersActive,
      usersTotal,
      coursesByStatus,
      enrollmentsByStatus,
      childrenTotal,
      certificatesTotal,
      enrollmentDates,
      certificateDates,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.user.count({ where: { active: true } }),
      prisma.user.count(),
      prisma.course.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.enrollment.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.child.count(),
      prisma.certificate.count(),
      prisma.enrollment.findMany({ select: { enrolledAt: true } }),
      prisma.certificate.findMany({ select: { issuedAt: true } }),
    ])

    const roleCount = (role: string) =>
      usersByRoleRaw.find((r) => r.role === role)?._count._all ?? 0
    const statusCourse = (status: CourseStatus) =>
      coursesByStatus.find((c) => c.status === status)?._count._all ?? 0
    const statusEnrollment = (status: EnrollmentStatus) =>
      enrollmentsByStatus.find((e) => e.status === status)?._count._all ?? 0

    return {
      usersByRole: {
        admin: roleCount('admin'),
        instrutor: roleCount('instrutor'),
        profissional: roleCount('profissional'),
      },
      usersTotal,
      usersActive,
      usersInactive: usersTotal - usersActive,
      courses: {
        published: statusCourse(CourseStatus.PUBLISHED),
        draft: statusCourse(CourseStatus.DRAFT),
        total: statusCourse(CourseStatus.PUBLISHED) + statusCourse(CourseStatus.DRAFT),
      },
      enrollments: {
        active: statusEnrollment(EnrollmentStatus.ACTIVE),
        completed: statusEnrollment(EnrollmentStatus.COMPLETED),
        cancelled: statusEnrollment(EnrollmentStatus.CANCELLED),
        total:
          statusEnrollment(EnrollmentStatus.ACTIVE) +
          statusEnrollment(EnrollmentStatus.COMPLETED) +
          statusEnrollment(EnrollmentStatus.CANCELLED),
      },
      childrenTotal,
      certificatesTotal,
      series: {
        enrollmentsByMonth: bucketByMonth(enrollmentDates.map((e) => e.enrolledAt)),
        completionsByMonth: bucketByMonth(certificateDates.map((c) => c.issuedAt)),
      },
    }
  })
}
