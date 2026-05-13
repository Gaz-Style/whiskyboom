import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Admin — Whiskyboom',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.variable} suppressHydrationWarning style={{ margin: 0, background: '#161B27', minHeight: '100vh' }}>
        <AdminLayoutClient>
          {children}
        </AdminLayoutClient>
      </body>
    </html>
  )
}
