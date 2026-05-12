import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import AdminSidebar from '@/components/admin/AdminSidebar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Admin — Whiskyboom',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.variable} suppressHydrationWarning style={{ margin: 0, background: '#161B27', minHeight: '100vh' }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <AdminSidebar />
          <main style={{ flex: 1, overflowX: 'hidden', minHeight: '100vh' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
