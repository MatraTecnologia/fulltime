const steps = [
  {
    num: '01',
    title: 'Crie sua conta',
    description: 'Cadastro gratuito em menos de um minuto. Sem cartão de crédito necessário.',
  },
  {
    num: '02',
    title: 'Escolha um curso',
    description:
      'Navegue pelo catálogo e encontre o conteúdo certo para a sua área de atuação.',
  },
  {
    num: '03',
    title: 'Aprenda no seu ritmo',
    description:
      'Videoaulas e materiais complementares disponíveis 24 horas, de qualquer dispositivo.',
  },
  {
    num: '04',
    title: 'Aplique e certifique',
    description:
      'Coloque em prática, conclua o curso e receba seu certificado de conclusão.',
  },
]

export const LandingHowItWorks = () => (
  <section className="bg-background px-6 py-20">
    <div className="mx-auto max-w-6xl">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">Como funciona</h2>
        <p className="mt-4 text-muted-foreground">Simples do começo ao fim</p>
      </div>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ num, title, description }) => (
          <div key={num} className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-lg font-extrabold text-accent">
              {num}
            </div>
            <h3 className="mb-2 font-bold text-foreground">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
