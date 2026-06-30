import { LandingNav } from '@/components/landing/nav'

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <LandingNav />
    {children}
  </>
)

export default PublicLayout
