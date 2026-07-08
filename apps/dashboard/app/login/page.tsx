import { Suspense } from "react"
import { GraduationCap, Sparkles } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { LoginForm } from "@/components/auth/login-form"

const LoginPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/30 blur-3xl"
        />
        <div className="relative flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/15">
            <GraduationCap className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Full Time</span>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" />
            Painel do Instrutor
          </span>
          <h2 className="mt-4 text-3xl font-semibold leading-tight">Ensine, inspire e transforme carreiras.</h2>
          <p className="mt-3 text-sm text-white/70">
            Gerencie seus cursos, acompanhe o progresso dos alunos e acompanhe seus resultados — tudo em um só lugar.
          </p>
        </div>

        <p className="relative text-xs text-white/50">© {2026} Full Time · Matra Tecnologia</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 text-center lg:items-start lg:text-left">
            <Logo />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
              <p className="mt-1 text-sm text-muted-foreground">Entre para acessar seu painel de instrutor.</p>
            </div>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
