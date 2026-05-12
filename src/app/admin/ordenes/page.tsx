'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Search, ChevronRight, Package } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  status: string
  total: number
  created_at: string
}

const statusColors: Record<string, string> = { pending: '#F59E0B', confirmed: '#3B82F6', shipped: '#8B5CF6', delivered: '#10B981', cancelled: '#EF4444' }
const statusLabels: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmado', shipped: 'En camino', delivered: 'Entregado', cancelled: 'Cancelado' }

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filterStatus) query = query.eq('status', filterStatus)
    const { data } = await query
    setOrders(data ?? [])
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { load() }, [load])

  const filtered = orders.filter(o =>
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(search.toLowerCase()) ||
    o.order_number.toLowerCase().includes(search.toLowerCase())
  )

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    toast.success(`Estado actualizado a "${statusLabels[status]}"`)
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1200px' }}>
      <Toaster position="top-right" />
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Órdenes</h1>
        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{filtered.length} órdenes</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente, email o N° de orden..."
            style={{ width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}>
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Cargando órdenes...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <Package size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            No hay órdenes
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['N° Orden', 'Cliente', 'Fecha', 'Total', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#C9A85C', fontWeight: '700', fontSize: '13px' }}>{order.order_number}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{order.customer_name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{order.customer_email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {format(new Date(order.created_at), "d MMM yyyy · HH:mm", { locale: es })}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'white', fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(order.total)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{ padding: '5px 10px', borderRadius: '6px', border: `1px solid ${statusColors[order.status]}40`, background: `${statusColors[order.status]}15`, color: statusColors[order.status], fontSize: '12px', fontWeight: '700', cursor: 'pointer', outline: 'none' }}
                    >
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/admin/ordenes/${order.id}`} style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}>
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
