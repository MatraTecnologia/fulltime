import Image from 'next/image'
import Link from 'next/link'

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary px-4 py-12">
    <div className="w-full max-w-md">
      <div className="mb-8 flex justify-center">
        <Link href="/">
          <Image src="/logo.svg" alt="Full Time" width={64} height={64} priority />
        </Link>
      </div>
      {children}
    </div>
  </main>
)

export default AuthLayout
