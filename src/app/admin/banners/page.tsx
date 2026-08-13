'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Plus, Save, Trash2, Eye, EyeOff, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

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
  const [savingId, setSavingId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('banners').select('*').order('sort_order')
    setBanners(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Instantly update local state to show in the live preview
  const handleFieldChange = (id: string, key: keyof Banner, value: any) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, [key]: value } : b))
  }

  // Save changes to Database on blur
  const saveField = async (id: string, key: keyof Banner, value: any) => {
    setSavingId(id)
    const { error } = await supabase.from('banners').update({ [key]: value }).eq('id', id)
    if (error) {
      toast.error('Error al guardar: ' + error.message)
    }
    setSavingId(null)
  }

  // Quick toggle saves immediately
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    handleFieldChange(id, 'is_active', !currentStatus)
    const { error } = await supabase.from('banners').update({ is_active: !currentStatus }).eq('id', id)
    if (error) {
      toast.error('Error al actualizar estado: ' + error.message)
      handleFieldChange(id, 'is_active', currentStatus)
    } else {
      toast.success(!currentStatus ? 'Banner activado' : 'Banner desactivado')
    }
  }

  const toggleBgColor = async (id: string, currentDark: boolean) => {
    handleFieldChange(id, 'dark', !currentDark)
    const { error } = await supabase.from('banners').update({ dark: !currentDark }).eq('id', id)
    if (error) {
      toast.error('Error al actualizar color: ' + error.message)
      handleFieldChange(id, 'dark', currentDark)
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('¿Eliminar este banner?')) return
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar: ' + error.message)
    } else {
      toast.success('Banner eliminado')
      setBanners(prev => prev.filter(b => b.id !== id))
    }
  }

  const addBanner = async () => {
    const { data, error } = await supabase.from('banners').insert([{
      title: 'Nuevo Banner', 
      subtitle: 'Subtítulo del banner', 
      cta_text: 'Ver más', 
      href: '/',
      dark: true, 
      is_active: false, 
      sort_order: banners.length + 1,
    }]).select()
    
    if (error) {
      toast.error('Error al crear banner: ' + error.message)
    } else if (data) {
      toast.success('Banner creado')
      setBanners(prev => [...prev, data[0]])
    }
  }

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id)
    try {
      const ext = file.name.split('.').pop()
      const path = `banners/${Date.now()}.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        toast.error('Error al subir la imagen: ' + uploadError.message)
        return
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      
      // Update DB
      const { error: dbError } = await supabase
        .from('banners')
        .update({ image_url: data.publicUrl })
        .eq('id', id)

      if (dbError) {
        toast.error('Error al actualizar base de datos: ' + dbError.message)
      } else {
        toast.success('Imagen cargada')
        handleFieldChange(id, 'image_url', data.publicUrl)
      }
    } catch (e: any) {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setUploadingId(null)
    }
  }

  const fieldStyle = {
    width: '100%', 
    padding: '8px 12px', 
    boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.06)', 
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px', 
    color: 'white', 
    fontSize: '13px', 
    outline: 'none',
    marginTop: '4px'
  }

  const labelStyle = { 
    display: 'block', 
    fontSize: '10px', 
    color: 'rgba(255,255,255,0.4)', 
    fontWeight: '700', 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.8px' 
  }

  // Separate Hero Banner from Promo Banners
  const heroBanner = banners.find(b => b.id === '00000000-0000-0000-0000-000000000000')
  const promoBanners = banners.filter(b => b.id !== '00000000-0000-0000-0000-000000000000')

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1400px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Banners y Promos</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Gestión del banner principal y grilla de promociones de la portada.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}>Cargando datos...</div>
      ) : (
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* LEFT COLUMN: Editors */}
          <div style={{ flex: '1.2', minWidth: '450px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* HERO BANNER EDITOR (ZONA 1) */}
            {heroBanner && (
              <div style={{
                background: 'rgba(201,168,92,0.03)', 
                border: '1.5px solid rgba(201,168,92,0.3)',
                borderRadius: '12px', 
                overflow: 'hidden',
              }}>
                <div style={{ background: 'rgba(201,168,92,0.08)', padding: '12px 20px', borderBottom: '1px solid rgba(201,168,92,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>✨</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#C9A85C', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Banner Principal (Hero - Zona Superior)
                  </span>
                </div>

                {/* Banner image strip */}
                <div 
                  onClick={() => document.getElementById(`file-${heroBanner.id}`)?.click()}
                  style={{
                    height: '140px', padding: '20px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #1E2530 0%, #2A3140 100%)',
                    position: 'relative', overflow: 'hidden', cursor: 'pointer'
                  }}
                  className="banner-preview-strip"
                >
                  <input
                    type="file"
                    id={`file-${heroBanner.id}`}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(heroBanner.id, file)
                    }}
                  />

                  {heroBanner.image_url && (
                    <img src={heroBanner.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                  )}

                  <div className="upload-overlay" style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    opacity: uploadingId === heroBanner.id ? 1 : 0,
                    transition: 'opacity 0.2s', zIndex: 2
                  }}>
                    {uploadingId === heroBanner.id ? (
                      <Loader2 size={24} style={{ color: '#C9A85C', animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <>
                        <Upload size={20} style={{ color: '#C9A85C', marginBottom: '4px' }} />
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>CLICK PARA SUBIR IMAGEN</span>
                      </>
                    )}
                  </div>

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ color: 'white', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                      {heroBanner.title || 'Sin Título'}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)', maxWidth: '400px' }}>
                      {heroBanner.subtitle || 'Subtítulo...'}
                    </div>
                  </div>
                </div>

                {/* Edit fields */}
                <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>TÍTULO GRANDE</label>
                    <input
                      value={heroBanner.title}
                      onChange={e => handleFieldChange(heroBanner.id, 'title', e.target.value)}
                      onBlur={e => saveField(heroBanner.id, 'title', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={labelStyle}>SUBTÍTULO / DESCRIPCIÓN</label>
                    <textarea
                      value={heroBanner.subtitle}
                      rows={2}
                      onChange={e => handleFieldChange(heroBanner.id, 'subtitle', e.target.value)}
                      onBlur={e => saveField(heroBanner.id, 'subtitle', e.target.value)}
                      style={{ ...fieldStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>TEXTO DEL BOTÓN</label>
                    <input
                      value={heroBanner.cta_text}
                      onChange={e => handleFieldChange(heroBanner.id, 'cta_text', e.target.value)}
                      onBlur={e => saveField(heroBanner.id, 'cta_text', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>
                  <div style={{ gridColumn: '2/4' }}>
                    <label style={labelStyle}>ENLACE DEL BOTÓN</label>
                    <input
                      value={heroBanner.href}
                      onChange={e => handleFieldChange(heroBanner.id, 'href', e.target.value)}
                      onBlur={e => saveField(heroBanner.id, 'href', e.target.value)}
                      style={fieldStyle}
                    />
                  </div>

                  {/* Controls */}
                  <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => toggleActiveStatus(heroBanner.id, heroBanner.is_active)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: heroBanner.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${heroBanner.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: '6px', padding: '6px 12px', color: heroBanner.is_active ? '#10B981' : '#EF4444', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                    >
                      {heroBanner.is_active ? 'Desactivar de la tienda' : 'Activar en la tienda'}
                    </button>
                    <div style={{ flex: 1 }} />
                    {savingId === heroBanner.id && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                        <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PROMO BANNERS GRID (ZONA 2) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.8px' }}>
                  Banners de Promociones (Zona Media)
                </h3>
                <button onClick={addBanner} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                  <Plus size={14} /> Agregar Promo
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {promoBanners.map(banner => (
                  <div key={banner.id} style={{
                    background: 'rgba(255,255,255,0.03)', 
                    border: `1px solid ${banner.is_active ? 'rgba(201,168,92,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: '12px', 
                    overflow: 'hidden',
                  }}>
                    <div 
                      onClick={() => document.getElementById(`file-${banner.id}`)?.click()}
                      style={{
                        height: '90px', padding: '16px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                        background: banner.dark
                          ? 'linear-gradient(135deg, #1E2530 0%, #2A3140 100%)'
                          : 'linear-gradient(135deg, #8B1A1A 0%, #2A3140 100%)',
                        position: 'relative', overflow: 'hidden', cursor: 'pointer'
                      }}
                      className="banner-preview-strip"
                    >
                      <input
                        type="file"
                        id={`file-${banner.id}`}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(banner.id, file)
                        }}
                      />

                      {banner.image_url && (
                        <img src={banner.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                      )}

                      <div className="upload-overlay" style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        opacity: uploadingId === banner.id ? 1 : 0,
                        transition: 'opacity 0.2s', zIndex: 2
                      }}>
                        {uploadingId === banner.id ? (
                          <Loader2 size={16} style={{ color: '#C9A85C', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <>
                            <Upload size={16} style={{ color: '#C9A85C', marginBottom: '2px' }} />
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'white' }}>CLICK PARA SUBIR IMAGEN</span>
                          </>
                        )}
                      </div>

                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ color: 'white', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                          {banner.title || 'Sin Título'}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                          {banner.subtitle || 'Subtítulo...'}
                        </div>
                      </div>
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#C9A85C', color: '#1a1a1a', fontSize: '9px', fontWeight: '800', padding: '3px 6px', borderRadius: '2px' }}>
                          {banner.cta_text || 'Ver más'} →
                        </span>
                        <span style={{
                          padding: '1px 5px', borderRadius: '4px', fontSize: '8px', fontWeight: '800',
                          background: banner.is_active ? '#10B981' : '#EF4444', color: 'white'
                        }}>
                          {banner.is_active ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                    </div>

                    {/* Edit fields */}
                    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      <div>
                        <label style={labelStyle}>TÍTULO</label>
                        <input
                          value={banner.title}
                          onChange={e => handleFieldChange(banner.id, 'title', e.target.value)}
                          onBlur={e => saveField(banner.id, 'title', e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>SUBTÍTULO</label>
                        <input
                          value={banner.subtitle}
                          onChange={e => handleFieldChange(banner.id, 'subtitle', e.target.value)}
                          onBlur={e => saveField(banner.id, 'subtitle', e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>TEXTO DEL CTA</label>
                        <input
                          value={banner.cta_text}
                          onChange={e => handleFieldChange(banner.id, 'cta_text', e.target.value)}
                          onBlur={e => saveField(banner.id, 'cta_text', e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div style={{ gridColumn: '1/3' }}>
                        <label style={labelStyle}>URL DEL ENLACE</label>
                        <input
                          value={banner.href}
                          onChange={e => handleFieldChange(banner.id, 'href', e.target.value)}
                          onBlur={e => saveField(banner.id, 'href', e.target.value)}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>URL IMAGEN</label>
                        <input
                          value={banner.image_url ?? ''}
                          readOnly
                          placeholder="Ninguna imagen"
                          style={{ ...fieldStyle, opacity: 0.7, cursor: 'not-allowed' }}
                        />
                      </div>

                      {/* Controls */}
                      <div style={{ gridColumn: '1/-1', display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => toggleActiveStatus(banner.id, banner.is_active)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: banner.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${banner.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: '6px', padding: '5px 10px', color: banner.is_active ? '#10B981' : '#EF4444', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                        >
                          {banner.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleBgColor(banner.id, banner.dark)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '5px 10px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                        >
                          Fondo: {banner.dark ? '🌑 Oscuro' : '🟥 Rojo'}
                        </button>
                        <div style={{ flex: 1 }} />
                        {savingId === banner.id && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteBanner(banner.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '5px 10px', color: '#EF4444', cursor: 'pointer', fontSize: '11px' }}
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Preview */}
          <div style={{ flex: '1', minWidth: '380px', position: 'sticky', top: '32px' }}>
            <div style={{
              background: '#12161D',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C9A85C', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                <span>👁️ VISTA PREVIA (PÁGINA PRINCIPAL)</span>
              </div>
              
              {/* 1. MOCK HERO BANNER PREVIEW */}
              {heroBanner && heroBanner.is_active && (
                <div style={{
                  height: '240px',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '24px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  {heroBanner.image_url && (
                    <img src={heroBanner.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
                  )}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(18,22,29,0.9) 0%, rgba(18,22,29,0.5) 100%)',
                    zIndex: 2
                  }} />
                  <div style={{ position: 'relative', zIndex: 3, maxWidth: '400px' }}>
                    <span style={{ color: '#C9A85C', fontSize: '8px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      TIENDA ESPECIALIZADA EN WHISKY PREMIUM
                    </span>
                    <h3 style={{
                      color: 'white',
                      fontSize: '22px',
                      fontWeight: '900',
                      lineHeight: '1.1',
                      textTransform: 'uppercase',
                      margin: '0 0 8px'
                    }}>
                      {heroBanner.title || 'Sin Título'}
                    </h3>
                    <p style={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: '11px',
                      lineHeight: '1.4',
                      margin: '0 0 16px'
                    }}>
                      {heroBanner.subtitle || 'Subtítulo del banner'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        background: '#C9A85C', color: '#1E2530', fontSize: '9px', fontWeight: '800',
                        textTransform: 'uppercase', padding: '5px 12px', borderRadius: '30px'
                      }}>
                        {heroBanner.cta_text || 'Explorar'}
                      </span>
                      <span style={{
                        border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '9px', fontWeight: '800',
                        textTransform: 'uppercase', padding: '5px 12px', borderRadius: '30px'
                      }}>
                        Ver Ofertas
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Decorative separator line */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>ZONA DE PROMOS MEDIA</span>
                <div style={{ height: '1px', flex: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* 2. MOCK PROMO BANNERS PREVIEW */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {promoBanners.filter(b => b.is_active).map((banner) => (
                  <div key={banner.id} style={{
                    height: '110px',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {banner.image_url && (
                      <img src={banner.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
                    )}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: banner.dark
                        ? 'linear-gradient(135deg, rgba(30,37,48,0.85) 0%, rgba(30,37,48,0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(139,26,26,0.8) 0%, rgba(30,37,48,0.4) 100%)',
                      zIndex: 2
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 3 }}>
                      <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', margin: '0 0 2px' }}>
                        {banner.title || 'Sin Título'}
                      </h4>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', margin: '0 0 8px' }}>
                        {banner.subtitle || 'Subtítulo...'}
                      </p>
                      <span style={{ display: 'inline-block', background: '#C9A85C', color: '#1E2530', fontSize: '8px', fontWeight: '800', padding: '3px 8px', borderRadius: '1px' }}>
                        {banner.cta_text || 'Ver'} →
                      </span>
                    </div>
                  </div>
                ))}
                
                {promoBanners.filter(b => b.is_active).length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}>
                    No hay promociones activas.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .banner-preview-strip:hover .upload-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}
