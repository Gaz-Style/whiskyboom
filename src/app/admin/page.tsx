'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/products'
import {
  Package, AlertTriangle, ShoppingBag, Mail,
  TrendingUp, ArrowRight, RefreshCw, Star, Tag
} from 'lucide-react'

interface Stats {
  total_products: number
  out_of_stock: number
  new_products: number
  on_sale: number
  limited_products: number
  featured_products: number
  top_sellers: number
  low_stock_count: number
  avg_price: number
  min_price: number
  max_price: number
}

interface RecentOrder {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  status: string
  total: number
  created_at: string
}

interface OutOfStockProduct {
  id: string
  name: string
  brand: string
  slug: string
}

const statusColors: Record<string, string> = {
  pending:   '#F59E0B',
  confirmed: '#3B82F6',
  shipped:   '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
}

const statusLabels: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  shipped:   'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}


function StatCard({ icon: Icon, label, value, sub, color, href }: {
  icon: React.ElementType, label: string, value: string | number,
  sub?: string, color: string, href?: string
}) {
  const content = (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px', padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: '16px',
      transition: 'all 0.2s', cursor: href ? 'pointer' : 'default',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
        background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ color: 'white', fontSize: '26px', fontWeight: '800', lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '4px' }}>{sub}</div>}
      </div>
      {href && <ArrowRight size={16} color="rgba(255,255,255,0.3)" />}
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<RecentOrder[]>([])
  const [outOfStock, setOutOfStock] = useState<OutOfStockProduct[]>([])
  const [newsletterCount, setNewsletterCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const [statsRes, ordersRes, stockRes, newsletterRes] = await Promise.all([
      supabase.from('admin_product_stats').select('*').single(),
      supabase.from('orders').select('id,order_number,customer_name,customer_email,status,total,created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('products').select('id,name,brand,slug').eq('in_stock', false).limit(5),
      supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ])
    if (statsRes.data) setStats(statsRes.data)
    if (ordersRes.data) setOrders(ordersRes.data)
    if (stockRes.data) setOutOfStock(stockRes.data)
    setNewsletterCount(newsletterRes.count ?? 0)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'white' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px', textTransform: 'capitalize' }}>{today}</p>
        </div>
        <button
          onClick={loadData}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.7)',
            fontSize: '13px', cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon={Package}       label="Total Productos"  value={stats?.total_products ?? '—'}    color="#C9A85C" href="/admin/productos" />
        <StatCard icon={AlertTriangle} label="Sin Stock"         value={stats?.out_of_stock ?? '—'}       color="#EF4444" href="/admin/productos" sub={stats?.out_of_stock ? 'Requieren atención' : 'Todo en orden ✓'} />
        <StatCard icon={TrendingUp}    label="Stock Bajo"         value={stats?.low_stock_count ?? '—'}   color="#F59E0B" href="/admin/productos" sub="Quedan pocos" />
        <StatCard icon={Star}          label="Top Sellers"        value={stats?.top_sellers ?? '—'}        color="#C9A85C" href="/admin/productos" />
        <StatCard icon={TrendingUp}    label="En Oferta"          value={stats?.on_sale ?? '—'}            color="#10B981" href="/admin/productos" />
        <StatCard icon={ShoppingBag}   label="Órdenes"            value={orders.length > 0 ? orders.length : '—'} color="#3B82F6" href="/admin/ordenes" />
        <StatCard icon={Mail}          label="Newsletter"         value={newsletterCount}                  color="#F59E0B" href="/admin/newsletter" sub="suscriptores activos" />
        <StatCard icon={Package}       label="Precio Promedio"    value={stats?.avg_price ? formatPrice(stats.avg_price) : '—'} color="#EC4899" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Recent orders */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>Órdenes Recientes</h2>
            <Link href="/admin/ordenes" style={{ color: '#C9A85C', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}>Ver todas →</Link>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
              No hay órdenes aún
            </div>
          ) : (
            orders.map(order => (
              <Link key={order.id} href={`/admin/ordenes/${order.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{order.customer_name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{order.order_number}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#C9A85C', fontSize: '13px', fontWeight: '700' }}>{formatPrice(order.total)}</div>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
                      fontSize: '10px', fontWeight: '600', textTransform: 'uppercase',
                      background: `${statusColors[order.status]}20`, color: statusColors[order.status],
                    }}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Out of stock */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {outOfStock.length > 0 && <AlertTriangle size={16} color="#EF4444" />}
              Sin Stock
            </h2>
            <Link href="/admin/productos" style={{ color: '#C9A85C', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}>Gestionar →</Link>
          </div>
          {outOfStock.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#10B981', fontSize: '13px' }}>
              ✓ Todos los productos tienen stock
            </div>
          ) : (
            outOfStock.map(p => (
              <Link key={p.id} href={`/admin/productos/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{p.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{p.brand}</div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                    background: 'rgba(239,68,68,0.15)', color: '#EF4444', textTransform: 'uppercase',
                  }}>
                    Sin Stock
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Quick actions */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px', padding: '24px',
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700' }}>Acciones Rápidas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { href: '/admin/productos/nuevo', label: '+ Agregar Producto',         color: '#C9A85C'              },
              { href: '/admin/banners',         label: '🖼️ Editar Banners',            color: '#3B82F6'              },
              { href: '/admin/categorias',       label: '🏷 Gestionar Categorías',       color: '#10B981'              },
              { href: '/admin/resenas',          label: '⭐ Moderar Reseñas',            color: '#F59E0B'              },
              { href: '/admin/envios',           label: '🚚 Zonas de Envío',              color: '#8B5CF6'              },
              { href: '/admin/configuracion',    label: '⚙ Configuración del Sitio',    color: 'rgba(255,255,255,0.5)'},
              { href: '/',                       label: '↗️ Ver Tienda Pública',          color: 'rgba(255,255,255,0.4)', blank: true },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                target={item.blank ? '_blank' : undefined}
                style={{
                  display: 'block', padding: '12px 16px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  color: item.color, textDecoration: 'none', fontSize: '13px', fontWeight: '600',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
