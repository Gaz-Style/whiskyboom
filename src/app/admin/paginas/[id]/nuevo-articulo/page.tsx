'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react'
import RichTextEditor from '@/components/admin/cms/RichTextEditor'

interface NewArticleProps {
  params: Promise<{ id: string }>
}

export default function AdminNewArticle({ params }: NewArticleProps) {
  const router = useRouter()
  const { id: pageId } = use(params)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

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

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `blog/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        toast.error('Error al subir imagen: ' + uploadError.message)
        return
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setImageUrl(data.publicUrl)
      toast.success('Imagen cargada')
    } catch (e) {
      toast.error('Error al cargar archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error('Por favor, completá los campos obligatorios (Título, Slug y Contenido)')
      return
    }

    setLoading(true)

    const { error } = await supabase.from('blog_posts').insert([{
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      is_active: isActive
    }])

    setLoading(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('Ya existe una entrada con este Slug. Elegí otro.')
      } else {
        toast.error('Error al guardar el artículo: ' + error.message)
      }
    } else {
      toast.success('Artículo creado con éxito')
      router.push(`/admin/paginas/${pageId}`)
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
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      
      {/* Back button */}
      <Link href={`/admin/paginas/${pageId}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Volver a la Edición de Blog
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Nuevo Artículo de Blog</h1>
        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
          Redactá un nuevo artículo de blog para tu audiencia.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Título del Artículo <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="text"
              required
              placeholder="Ej. Guía de cata para principiantes"
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
                placeholder="guia-de-cata"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                style={{ ...inputStyle, paddingLeft: '22px' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>/blog/</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div>
          <label style={labelStyle}>Imagen de Portada (Featured Image)</label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
            <input
              type="text"
              placeholder="Sin imagen cargada"
              value={imageUrl}
              readOnly
              style={{ ...inputStyle, marginTop: 0, flex: 1, opacity: 0.7, cursor: 'not-allowed' }}
            />
            <input
              type="file"
              id="featured-image-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => document.getElementById('featured-image-upload')?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px', color: 'white', padding: '8px 14px', fontSize: '12px',
                fontWeight: '700', cursor: 'pointer'
              }}
            >
              {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
              Subir Foto
            </button>
          </div>
          {imageUrl && (
            <img src={imageUrl} alt="Portada" style={{ marginTop: '12px', width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label style={labelStyle}>Resumen / Copete Corto</label>
          <textarea
            rows={3}
            placeholder="Resumen corto del artículo para mostrar en la grilla del blog."
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            style={{ ...inputStyle, resize: 'none' }}
          />
        </div>

        {/* Rich content editor */}
        <div>
          <label style={labelStyle}>Cuerpo del Artículo <span style={{ color: '#EF4444' }}>*</span></label>
          <RichTextEditor value={content} onChange={setContent} />
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
            Publicar inmediatamente (Activo)
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
          <Link href={`/admin/paginas/${pageId}`} style={{ textDecoration: 'none' }}>
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
            Publicar Artículo
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
