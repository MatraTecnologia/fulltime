import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

export const metadata: Metadata = {
  title: 'Full Time — Capacitação para educação inclusiva',
  description: 'Acolher · Desenvolver · Incluir',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR" className={`${inter.variable} ${nunito.variable}`}>
    <body>{children}</body>
  </html>
)

export default RootLayout
