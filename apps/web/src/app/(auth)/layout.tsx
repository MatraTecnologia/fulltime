const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex min-h-screen items-center justify-center px-4 py-12">
    <div className="w-full max-w-md">{children}</div>
  </main>
)

export default AuthLayout
