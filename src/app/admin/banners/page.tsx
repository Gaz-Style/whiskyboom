'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Plus, Save, Trash2, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle: string
  cta_text: string
  href: string
  image_url: string | null
  dark: boolean
  is_active: boolean
  sort_order: number
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('banners').select('*').order('sort_order')
    setBanners(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const update = async (id: string, updates: Partial<Banner>) => {
    setSaving(id)
    const { error } = await supabase.from('banners').update(updates).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Banner actualizado'); setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b)) }
    setSaving(null)
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return
    await supabase.from('banners').delete().eq('id', id)
    toast.success('Banner eliminado')
    load()
  }

  const addBanner = async () => {
    const { error } = await supabase.from('banners').insert([{
      title: 'Nuevo Banner', subtitle: 'Subtítulo del banner', cta_text: 'Ver más', href: '/',
      dark: true, is_active: false, sort_order: banners.length + 1,
    }])
    if (!error) { toast.success('Banner creado — editá los campos'); load() }
  }

  const fieldStyle = {
    width: '100%', padding: '8px 12px', boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', color: 'white', fontSize: '13px', outline: 'none',
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '900px' }}>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Banners y Promos</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Gestión de banners de la página principal</p>
        </div>
        <button onClick={addBanner} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#C9A85C', color: '#1a1a1a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          <Plus size={16} /> Agregar Banner
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {banners.map(banner => (
            <div key={banner.id} style={{
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${banner.is_active ? 'rgba(201,168,92,0.25)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '12px', overflow: 'hidden',
            }}>
              {/* Preview strip */}
              <div style={{
                height: '80px', padding: '16px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                background: banner.dark
                  ? 'linear-gradient(135deg, #1E2530 0%, #2A3140 100%)'
                  : 'linear-gradient(135deg, #8B1A1A 0%, #2A3140 100%)',
                position: 'relative', overflow: 'hidden',
              }}>
                {banner.image_url && (
                  <img src={banner.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase' }}>{banner.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{banner.subtitle}</div>
                </div>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#C9A85C', color: '#1a1a1a', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '2px' }}>
                    {banner.cta_text} →
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                    background: banner.is_active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                    color: banner.is_active ? '#10B981' : '#EF4444',
                  }}>
                    {banner.is_active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>

              {/* Edit fields */}
              <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>TÍTULO</label>
                  <input
                    defaultValue={banner.title}
                    onBlur={e => update(banner.id, { title: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>SUBTÍTULO</label>
                  <input
                    defaultValue={banner.subtitle}
                    onBlur={e => update(banner.id, { subtitle: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>TEXTO DEL CTA</label>
                  <input
                    defaultValue={banner.cta_text}
                    onBlur={e => update(banner.id, { cta_text: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
                <div style={{ gridColumn: '1/3' }}>
                  <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>URL DEL ENLACE</label>
                  <input
                    defaultValue={banner.href}
                    onBlur={e => update(banner.id, { href: e.target.value })}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>URL IMAGEN</label>
                  <input
                    defaultValue={banner.image_url ?? ''}
                    onBlur={e => update(banner.id, { image_url: e.target.value || null })}
                    placeholder="/promo-banner.jpg"
                    style={fieldStyle}
                  />
                </div>

                {/* Controls */}
                <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '4px' }}>
                  <button
                    onClick={() => update(banner.id, { is_active: !banner.is_active })}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: banner.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${banner.is_active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '6px', padding: '7px 14px', color: banner.is_active ? '#10B981' : '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    {banner.is_active ? <><Eye size={14} /> Desactivar</> : <><EyeOff size={14} /> Activar</>}
                  </button>
                  <button
                    onClick={() => update(banner.id, { dark: !banner.dark })}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '7px 14px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Fondo: {banner.dark ? '🌑 Oscuro' : '🟥 Rojo'}
                  </button>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '7px 14px', color: '#EF4444', cursor: 'pointer', fontSize: '12px' }}
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
