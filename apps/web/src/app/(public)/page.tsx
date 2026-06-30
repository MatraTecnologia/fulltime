import { Button, Card, CardContent, CardTitle } from '@fulltime/ui'

const HomePage = () => (
  <main className="mx-auto max-w-5xl px-6 py-20">
    <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-brand-navy">
      Acolher · Desenvolver · Incluir
    </h1>
    <p className="mt-4 max-w-xl text-lg text-brand-navy/70">
      Capacitação para profissionais que transformam a vida de crianças atípicas.
    </p>
    <div className="mt-8 flex gap-4">
      <Button>Explorar cursos</Button>
      <Button variant="outline">Entrar</Button>
    </div>
    <Card className="mt-16">
      <CardContent>
        <CardTitle>Plataforma em construção</CardTitle>
      </CardContent>
    </Card>
  </main>
)

export default HomePage
