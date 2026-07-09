import type { FastifyInstance } from 'fastify'
import { requireAuth, requireRole } from '../../lib/session.js'
import {
  getInstructorComments,
  getInstructorCourses,
  getInstructorOverview,
  getInstructorReports,
  getInstructorStudents,
} from '../../lib/instructor-metrics.js'

export default async function instructorRoutes(app: FastifyInstance) {
  const guard = { preHandler: [requireAuth, requireRole('admin', 'instrutor')] }

  app.get('/instructor/courses', {
    ...guard,
    schema: { tags: ['instructor'], summary: 'Cursos do instrutor com métricas agregadas' },
  }, async (request) => getInstructorCourses(request.session.user.id))

  app.get('/instructor/overview', {
    ...guard,
    schema: { tags: ['instructor'], summary: 'Métricas da visão geral do instrutor' },
  }, async (request) => getInstructorOverview(request.session.user.id))

  app.get('/instructor/reports', {
    ...guard,
    schema: { tags: ['instructor'], summary: 'Métricas agregadas para a página de relatórios' },
  }, async (request) => getInstructorReports(request.session.user.id))

  app.get('/instructor/students', {
    ...guard,
    schema: { tags: ['instructor'], summary: 'Alunos matriculados nos cursos do instrutor' },
  }, async (request) => getInstructorStudents(request.session.user.id))

  app.get('/instructor/comments', {
    ...guard,
    schema: { tags: ['instructor'], summary: 'Comentários dos alunos nas aulas dos cursos do instrutor' },
  }, async (request) => getInstructorComments(request.session.user.id))
}
