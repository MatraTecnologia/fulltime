import { apiServer } from '@/lib/api'
import type { CourseListItem } from '@/lib/types'
import { LandingHero } from '@/components/landing/hero'
import { LandingPillars } from '@/components/landing/pillars'
import { LandingFeaturedCourses } from '@/components/landing/featured-courses'
import { LandingAudience } from '@/components/landing/audience'
import { LandingHowItWorks } from '@/components/landing/how-it-works'
import { LandingCtaFinal } from '@/components/landing/cta-final'
import { LandingFooter } from '@/components/landing/footer'

export const dynamic = 'force-dynamic'

const HomePage = async () => {
  const courses = await apiServer<CourseListItem[]>('/courses')
  const featured = courses.slice(0, 6)

  return (
    <>
      <main>
        <LandingHero />
        <LandingPillars />
        <LandingFeaturedCourses courses={featured} />
        <LandingAudience />
        <LandingHowItWorks />
        <LandingCtaFinal />
      </main>
      <LandingFooter />
    </>
  )
}

export default HomePage
