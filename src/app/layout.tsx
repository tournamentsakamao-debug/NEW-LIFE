import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Admin's Tournament",
  description: 'Professional eSports Tournament Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-luxury-black min-h-screen`}>
        {children}
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  )
}
