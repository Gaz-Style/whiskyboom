'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Save, Plus, Trash2, Truck } from 'lucide-react'

interface Zone {
  id: string
  province: string
  city: string | null
  cost: number
  days_min: number
  days_max: number
  is_free_above: number | null
  is_active: boolean
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

export default function AdminEnviosPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, Partial<Zone>>>({})

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('shipping_zones').select('*').order('province')
    setZones(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setEdit = (id: string, field: keyof Zone, value: string | number | boolean | null) => {
    setEdits(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), [field]: value } }))
  }

  const save = async (id: string) => {
    if (!edits[id]) return
    setSaving(id)
    const { error } = await supabase.from('shipping_zones').update(edits[id]).eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Zona actualizada')
      setZones(prev => prev.map(z => z.id === id ? { ...z, ...edits[id] } : z))
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n })
    }
    setSaving(null)
  }

  const addZone = async () => {
    const { data, error } = await supabase.from('shipping_zones').insert([{
      province: 'Nueva Provincia', cost: 5000, days_min: 5, days_max: 10, is_active: true
    }]).select().single()
    if (!error && data) { setZones(prev => [...prev, data]); toast.success('Zona agregada') }
  }

  const deleteZone = async (id: string) => {
    if (!confirm('¿Eliminar esta zona de envío?')) return
    await supabase.from('shipping_zones').delete().eq('id', id)
    setZones(prev => prev.filter(z => z.id !== id))
    toast.success('Zona eliminada')
  }

  const inp = (id: string, field: keyof Zone, type: string, value: string | number) => (
    <input
      type={type}
      defaultValue={value as string}
      onChange={e => setEdit(id, field, type === 'number' ? Number(e.target.value) : e.target.value)}
      style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '12px', outline: 'none', width: '100%', boxSizing: 'border-box' as const }}
    />
  )

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1200px' }}>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={22} color="#C9A85C" /> Zonas de Envío
          </h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{zones.length} provincias configuradas</p>
        </div>
        <button onClick={addZone} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#C9A85C', color: '#1a1a1a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          <Plus size={16} /> Agregar Zona
        </button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Cargando zonas...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Provincia', 'Costo (ARS)', 'Días mín', 'Días máx', 'Gratis desde (ARS)', 'Activo', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => (
                <tr key={zone.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: edits[zone.id] ? 'rgba(201,168,92,0.05)' : 'transparent' }}>
                  <td style={{ padding: '10px 14px' }}>{inp(zone.id, 'province', 'text', zone.province)}</td>
                  <td style={{ padding: '10px 14px' }}>{inp(zone.id, 'cost', 'number', zone.cost)}</td>
                  <td style={{ padding: '10px 14px' }}>{inp(zone.id, 'days_min', 'number', zone.days_min)}</td>
                  <td style={{ padding: '10px 14px' }}>{inp(zone.id, 'days_max', 'number', zone.days_max)}</td>
                  <td style={{ padding: '10px 14px' }}>{inp(zone.id, 'is_free_above', 'number', zone.is_free_above ?? '')}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={zone.is_active} onChange={e => setEdit(zone.id, 'is_active', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#10B981' }} />
                    </label>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {edits[zone.id] && (
                        <button onClick={() => save(zone.id)} disabled={saving === zone.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(201,168,92,0.1)', border: '1px solid rgba(201,168,92,0.3)', borderRadius: '6px', padding: '5px 10px', color: '#C9A85C', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                          <Save size={12} /> {saving === zone.id ? '...' : 'Guardar'}
                        </button>
                      )}
                      <button onClick={() => deleteZone(zone.id)} style={{ display: 'flex', alignItems: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '5px 8px', color: '#EF4444', cursor: 'pointer' }}>
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

      <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(201,168,92,0.08)', border: '1px solid rgba(201,168,92,0.15)', borderRadius: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
        💡 Los cambios se guardan al hacer clic en "Guardar" en cada fila. El monto de envío gratis (0 = siempre pago, vacío = nunca gratis).
      </div>
    </div>
  )
}
