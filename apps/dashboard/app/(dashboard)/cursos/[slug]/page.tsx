import { CourseDetailConnected } from "@/components/dashboard/course-detail/course-detail-connected"

const CoursePage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  return <CourseDetailConnected slug={slug} />
}

export default CoursePage
