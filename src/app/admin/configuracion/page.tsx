'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Save, Loader2 } from 'lucide-react'

type Settings = Record<string, string>

const SETTING_GROUPS = [
  {
    title: '📢 Announcement Bar',
    keys: [
      { key: 'announcement_text', label: 'Texto del banner', type: 'text', placeholder: '🥃 Envío gratis en compras mayores a $50.000' },
      { key: 'announcement_active', label: 'Mostrar announcement bar', type: 'toggle' },
      { key: 'announcement_color', label: 'Color de fondo', type: 'color' },
    ],
  },
  {
    title: '🚚 Envíos',
    keys: [
      { key: 'shipping_free_text', label: 'Texto de envío gratis', type: 'text', placeholder: 'Envío gratis en compras mayores a $50.000' },
      { key: 'shipping_min_amount', label: 'Monto mínimo para envío gratis (ARS)', type: 'number', placeholder: '50000' },
    ],
  },
  {
    title: '📱 Redes Sociales',
    keys: [
      { key: 'instagram_url', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/whiskyboom' },
      { key: 'facebook_url', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
      { key: 'twitter_url', label: 'Twitter / X', type: 'url', placeholder: 'https://twitter.com/...' },
    ],
  },
  {
    title: '📞 Contacto',
    keys: [
      { key: 'contact_email', label: 'Email de contacto', type: 'email', placeholder: 'hola@whiskyboom.com.ar' },
      { key: 'contact_phone', label: 'Teléfono', type: 'text', placeholder: '+54 11 0000-0000' },
      { key: 'contact_address', label: 'Dirección', type: 'text', placeholder: 'Buenos Aires, Argentina' },
    ],
  },
  {
    title: '🔍 SEO',
    keys: [
      { key: 'meta_title', label: 'Título SEO por defecto', type: 'text', placeholder: 'Whiskyboom | Tienda de Whisky Premium' },
      { key: 'meta_description', label: 'Descripción SEO por defecto', type: 'textarea', placeholder: 'Descubrí la mejor selección...' },
    ],
  },
]

export default function AdminConfigPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      const map: Settings = {}
      data?.forEach(({ key, value }) => { if (value) map[key] = value })
      setSettings(map)
      setLoading(false)
    })
  }, [])

  const set = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }))
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
    if (error) toast.error('Error: ' + error.message)
    else toast.success('Configuración guardada')
    setSaving(false)
  }

  const fieldStyle = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none',
  }
  const labelStyle = { display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: '6px' }

  if (loading) return <div style={{ padding: '32px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter, system-ui)' }}>Cargando configuración...</div>

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '800px' }}>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Configuración</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Ajustes generales del sitio</p>
        </div>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: saving ? 'rgba(201,168,92,0.5)' : '#C9A85C', color: '#1a1a1a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
          {saving ? 'Guardando...' : 'Guardar Todo'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SETTING_GROUPS.map(group => (
          <div key={group.title} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {group.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {group.keys.map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  {field.type === 'toggle' ? (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings[field.key] === 'true'}
                        onChange={e => set(field.key, e.target.checked ? 'true' : 'false')}
                        style={{ width: '18px', height: '18px', accentColor: '#C9A85C' }}
                      />
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                        {settings[field.key] === 'true' ? 'Visible' : 'Oculto'}
                      </span>
                    </label>
                  ) : field.type === 'color' ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={settings[field.key] || '#8B1A1A'}
                        onChange={e => set(field.key, e.target.value)}
                        style={{ width: '44px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none', padding: '2px' }}
                      />
                      <input
                        value={settings[field.key] || ''}
                        onChange={e => set(field.key, e.target.value)}
                        placeholder="#8B1A1A"
                        style={{ ...fieldStyle, maxWidth: '140px' }}
                      />
                    </div>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={settings[field.key] || ''}
                      onChange={e => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      style={{ ...fieldStyle, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={settings[field.key] || ''}
                      onChange={e => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      style={fieldStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
