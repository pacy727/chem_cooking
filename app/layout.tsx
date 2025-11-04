// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'La Cucina Chimica - 化学反応キッチン',
  description: 'シェフとして化学反応を使って完璧な料理を作るゲーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lobster&family=Noto+Sans+JP:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
