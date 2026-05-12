'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Mail, Trash2, Search, Download } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Subscriber {
  id: string
  email: string
  name: string | null
  is_active: boolean
  created_at: string
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false })
    setSubscribers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggle = async (id: string, current: boolean) => {
    await supabase.from('newsletter_subscribers').update({ is_active: !current }).eq('id', id)
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
    toast.success(current ? 'Suscriptor desactivado' : 'Suscriptor reactivado')
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar suscriptor?')) return
    await supabase.from('newsletter_subscribers').delete().eq('id', id)
    setSubscribers(prev => prev.filter(s => s.id !== id))
    toast.success('Suscriptor eliminado')
  }

  const exportCSV = () => {
    const csv = ['Email,Nombre,Estado,Fecha', ...subscribers.map(s =>
      `${s.email},${s.name ?? ''},${s.is_active ? 'Activo' : 'Inactivo'},${format(new Date(s.created_at), 'dd/MM/yyyy')}`
    )].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'newsletter.csv'; a.click()
  }

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const active = subscribers.filter(s => s.is_active).length

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '900px' }}>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Newsletter</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            {active} activos · {subscribers.length} total
          </p>
        </div>
        <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 16px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '13px' }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por email o nombre..."
          style={{ width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <Mail size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            Sin suscriptores aún
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Email', 'Nombre', 'Estado', 'Fecha', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => (
                <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: sub.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '12px 16px', color: 'white', fontSize: '13px' }}>{sub.email}</td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{sub.name ?? '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: sub.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: sub.is_active ? '#10B981' : '#EF4444' }}>
                      {sub.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {format(new Date(sub.created_at), "d MMM yyyy", { locale: es })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggle(sub.id, sub.is_active)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 10px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '11px' }}>
                        {sub.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button onClick={() => remove(sub.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '5px 8px', color: '#EF4444', cursor: 'pointer', display: 'flex' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
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
