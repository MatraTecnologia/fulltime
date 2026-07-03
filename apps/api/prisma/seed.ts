import { prisma } from '../src/lib/prisma.js'

const categorias = [
  { slug: 'praticas-pedagogicas', name: 'Práticas Pedagógicas', description: 'Metodologias e estratégias para a sala de aula.', color: '#8649a5', icon: '📚' },
  { slug: 'inclusao', name: 'Inclusão', description: 'Educação inclusiva e acessibilidade.', color: '#0d92e1', icon: '🤝' },
  { slug: 'neurodesenvolvimento', name: 'Neurodesenvolvimento', description: 'Bases neurológicas do aprendizado.', color: '#fdb509', icon: '🧠' },
  { slug: 'psicomotricidade', name: 'Psicomotricidade', description: 'Corpo, movimento e desenvolvimento.', color: '#032e5b', icon: '🏃' },
  { slug: 'gestao-escolar', name: 'Gestão Escolar', description: 'Liderança e administração educacional.', color: '#6ba93c', icon: '🏛️' },
  { slug: 'tecnologias-educacionais', name: 'Tecnologias Educacionais', description: 'Ferramentas digitais para ensinar.', color: '#0d92e1', icon: '💻' },
]

const trilhas = [
  { slug: 'alfabetizacao-inclusiva', title: 'Alfabetização Inclusiva', description: 'Jornada completa para alfabetizar respeitando todas as formas de aprender.', color: 'bg-brand-blue', icon: '⚓', level: 'INICIANTE' as const },
  { slug: 'educacao-infantil', title: 'Educação Infantil', description: 'Da acolhida ao letramento na primeira infância.', color: 'bg-brand-purple', icon: '🧩', level: 'INICIANTE' as const },
  { slug: 'gestao-escolar', title: 'Gestão Escolar', description: 'Ferramentas de liderança para coordenadores e diretores.', color: 'bg-brand-green', icon: '🏛️', level: 'INTERMEDIARIO' as const },
  { slug: 'desenvolvimento-infantil', title: 'Desenvolvimento Infantil', description: 'Marcos do desenvolvimento e intervenção precoce.', color: 'bg-brand-amber', icon: '🌱', level: 'INICIANTE' as const },
]

const eventos = [
  { slug: 'estrategias-tea', title: 'Estratégias para Crianças com TEA', description: 'Webinário prático sobre intervenções baseadas em evidências para o Transtorno do Espectro Autista.', type: 'WEBINAR' as const, startsAt: new Date('2026-08-15T23:00:00Z'), durationMin: 90, url: 'https://meet.google.com/full-time-tea' },
  { slug: 'inclusao-na-pratica', title: 'Inclusão na Prática', description: 'Live com estudos de caso reais de inclusão em sala de aula.', type: 'LIVE' as const, startsAt: new Date('2026-08-22T22:00:00Z'), durationMin: 60, url: 'https://youtube.com/live/full-time-inclusao' },
  { slug: 'neurodesenvolvimento-webinar', title: 'Neurodesenvolvimento e Aprendizagem', description: 'Como o cérebro aprende: fundamentos para a prática pedagógica.', type: 'WEBINAR' as const, startsAt: new Date('2026-09-05T23:00:00Z'), durationMin: 90, url: 'https://meet.google.com/full-time-neuro' },
]

const seed = async () => {
  for (const c of categorias) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c })
  }

  for (const t of trilhas) {
    await prisma.track.upsert({
      where: { slug: t.slug },
      update: { ...t, status: 'PUBLISHED' },
      create: { ...t, status: 'PUBLISHED' },
    })
  }

  for (const e of eventos) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: { ...e, status: 'PUBLISHED' },
      create: { ...e, status: 'PUBLISHED' },
    })
  }

  const publishedCourses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })

  if (publishedCourses.length > 0) {
    const allCategories = await prisma.category.findMany({ select: { id: true, slug: true } })
    for (let i = 0; i < publishedCourses.length; i++) {
      const cat = allCategories[i % allCategories.length]
      await prisma.course.update({
        where: { id: publishedCourses[i].id },
        data: { categories: { connect: { id: cat.id } } },
      })
    }

    for (const t of trilhas) {
      const track = await prisma.track.findUnique({ where: { slug: t.slug }, select: { id: true } })
      if (!track) continue
      const slice = publishedCourses.slice(0, Math.min(4, publishedCourses.length))
      for (let order = 0; order < slice.length; order++) {
        await prisma.trackCourse.upsert({
          where: { trackId_courseId: { trackId: track.id, courseId: slice[order].id } },
          update: { order },
          create: { trackId: track.id, courseId: slice[order].id, order },
        })
      }
    }
  }

  const counts = {
    categorias: await prisma.category.count(),
    trilhas: await prisma.track.count(),
    eventos: await prisma.event.count(),
  }
  return counts
}

seed()
  .then((counts) => {
    process.stdout.write(`Seed concluído: ${JSON.stringify(counts)}\n`)
    return prisma.$disconnect()
  })
  .catch(async (error) => {
    process.stderr.write(`Seed falhou: ${error}\n`)
    await prisma.$disconnect()
    process.exit(1)
  })
