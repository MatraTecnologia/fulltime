import type { Metadata } from 'next'
import { Inter, Nunito } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

const title = 'Full Time — Capacitação para educação inclusiva'
const description = 'Acolher · Desenvolver · Incluir'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title,
  description,
  keywords: ['educação inclusiva', 'TEA', 'TDAH', 'capacitação', 'profissionais', 'crianças atípicas', 'desenvolvimento infantil'],
  icons: {
    icon: [
      { url: '/icone.ico', sizes: 'any' },
      { url: '/icone.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icone.ico',
    apple: '/icone.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Full Time',
    title,
    description,
    images: [{ url: '/icone.svg', width: 586, height: 582, alt: 'Full Time' }],
  },
  twitter: {
    card: 'summary',
    title,
    description,
    images: ['/icone.svg'],
  },
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR" className={`${inter.variable} ${nunito.variable}`}>
    <body>{children}</body>
  </html>
)

export default RootLayout
