'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import BlockEditor from '@/components/admin/cms/BlockEditor'
import CMSPreview from '@/components/admin/cms/CMSPreview'

export default function AdminNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState<any[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null)

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val)
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
      .trim()
      .replace(/\s+/g, '-') // replace spaces with hyphens
      .replace(/-+/g, '-') // replace multiple hyphens
    setSlug(generatedSlug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !slug.trim()) {
      toast.error('Por favor, completá los campos obligatorios (Título y Slug)')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('custom_pages').insert([{
      title: title.trim(),
      slug: slug.trim(),
      blocks: blocks,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      is_active: isActive
    }])

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('Ya existe una página con este Slug. Elegí otro.')
      } else {
        toast.error('Error al guardar la página: ' + error.message)
      }
    } else {
      toast.success('Página creada con éxito')
      router.push('/admin/paginas')
      router.refresh()
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    marginTop: '6px',
    fontFamily: 'inherit'
  }

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1400px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      
      {/* Back button */}
      <Link href="/admin/paginas" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Volver a Páginas
      </Link>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* LEFT COLUMN: Editor Form (Width 55%) */}
        <div style={{ flex: '1.2', minWidth: '450px' }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Nueva Página Interactiva</h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Creá y diseñá tu página con previsualización en vivo.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Título de la Página <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Nosotros"
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={labelStyle}>Ruta / Slug (URL) <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="ej-nosotros"
                    value={slug}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    style={{ ...inputStyle, paddingLeft: '22px' }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>/</span>
                </div>
              </div>
            </div>

            {/* Visual Blocks Designer */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: 'white' }}>Secciones de la Página</h3>
              <BlockEditor 
                blocks={blocks} 
                onChange={setBlocks} 
                activeBlockIndex={activeBlockIndex}
                setActiveBlockIndex={setActiveBlockIndex}
              />
            </div>

            {/* SEO Group */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '10px'
            }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: '700', color: '#C9A85C' }}>Configuración SEO</h3>
              
              <div>
                <label style={labelStyle}>Título SEO (Meta Title)</label>
                <input
                  type="text"
                  placeholder="Opcional. Si se deja vacío, usará el Título de la página."
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Descripción SEO (Meta Description)</label>
                <textarea
                  rows={3}
                  placeholder="Opcional. Resumen de la página para buscadores como Google."
                  value={metaDescription}
                  onChange={e => setMetaDescription(e.target.value)}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#C9A85C' }}
              />
              <label htmlFor="is_active" style={{ fontSize: '13px', color: 'white', cursor: 'pointer', fontWeight: '500' }}>
                Publicar página inmediatamente (Activa)
              </label>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
              <Link href="/admin/paginas" style={{ textDecoration: 'none' }}>
                <button type="button" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#C9A85C',
                  color: '#1a1a1a',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Crear Página
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Preview (Width 45%) */}
        <div style={{ flex: '1', minWidth: '380px', position: 'sticky', top: '32px' }}>
          <CMSPreview blocks={blocks} pageTitle={title} activeBlockIndex={activeBlockIndex} />
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
