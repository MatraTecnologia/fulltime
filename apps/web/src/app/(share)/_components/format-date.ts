export const formatDate = (value: string | null) => {
  if (!value) return ''
  const [y, m, d] = value.slice(0, 10).split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR')
}

export const formatDateLong = (value: string | null) => {
  if (!value) return ''
  const [y, m, d] = value.slice(0, 10).split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
