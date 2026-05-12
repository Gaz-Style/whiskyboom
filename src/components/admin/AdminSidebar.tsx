'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard,
  Package,
  Tag,
  Image as ImageIcon,
  ShoppingBag,
  Mail,
  Settings,
  ExternalLink,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Glasses,
  Star,
  Truck,
} from 'lucide-react'

const navItems = [
  { href: '/admin',              label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/productos',    label: 'Productos',     icon: Package },
  { href: '/admin/categorias',   label: 'Categorías',    icon: Tag },
  { href: '/admin/banners',      label: 'Banners',       icon: ImageIcon },
  { href: '/admin/ordenes',      label: 'Órdenes',       icon: ShoppingBag },
  { href: '/admin/resenas',      label: 'Reseñas',       icon: Star },
  { href: '/admin/envios',       label: 'Envíos',        icon: Truck },
  { href: '/admin/newsletter',   label: 'Newsletter',    icon: Mail },
  { href: '/admin/configuracion',label: 'Configuración', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0F1117',
      borderRight: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 12px' : '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '12px',
      }}>
        {!collapsed && (
          <div>
            <div style={{ color: 'white', fontSize: '16px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>
              WHISKY<span style={{ color: '#C9A85C' }}>BOOM</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Admin Panel
            </div>
          </div>
        )}
        {collapsed && <Glasses size={22} color="#C9A85C" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}
        >
          <ChevronLeft size={16} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '10px 12px' : '10px 14px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
                background: active ? 'rgba(201,168,92,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #C9A85C' : '3px solid transparent',
                fontSize: '13px',
                fontWeight: active ? '600' : '400',
                transition: 'all 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <Icon size={18} style={{ flexShrink: 0, color: active ? '#C9A85C' : 'rgba(255,255,255,0.4)' }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: collapsed ? '10px 12px' : '10px 14px',
            borderRadius: '8px', marginBottom: '4px',
            textDecoration: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: '13px', justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <ExternalLink size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Ver Sitio</span>}
        </Link>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
            padding: collapsed ? '10px 12px' : '10px 14px',
            borderRadius: '8px', background: 'none', border: 'none',
            cursor: 'pointer', color: 'rgba(255,100,100,0.7)',
            fontSize: '13px', justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className="admin-sidebar-desktop"
        style={{
          width: collapsed ? '60px' : '220px',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          transition: 'width 0.2s ease',
          overflow: 'hidden',
        }}
      >
        {sidebarContent}
      </div>

      {/* Mobile toggle */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed', top: '16px', left: '16px', zIndex: 200,
          background: '#C9A85C', border: 'none', borderRadius: '8px',
          padding: '8px', cursor: 'pointer', display: 'none',
        }}
      >
        <Menu size={20} color="#1a1a1a" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex' }}
          onClick={() => setMobileOpen(false)}
        >
          <div style={{ width: '220px' }} onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)' }} />
          <button
            onClick={() => setMobileOpen(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </>
  )
}
