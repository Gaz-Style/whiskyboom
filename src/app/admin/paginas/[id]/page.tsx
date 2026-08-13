'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { 
  ArrowLeft, Save, Loader2, Plus, Edit2, 
  Trash2, Eye, EyeOff, Search, Calendar, 
  BookOpen, ExternalLink 
} from 'lucide-react'
import BlockEditor from '@/components/admin/cms/BlockEditor'
import CMSPreview from '@/components/admin/cms/CMSPreview'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default function AdminEditPage({ params }: EditPageProps) {
  const router = useRouter()
  const { id } = use(params)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState<any[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null)

  // Blog management states (Only used when slug === 'blog')
  const [posts, setPosts] = useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [postSearch, setPostSearch] = useState('')

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        toast.error('Error al cargar la página: ' + error.message)
        router.push('/admin/paginas')
      } else if (data) {
        setTitle(data.title)
        setSlug(data.slug)
        setBlocks(data.blocks || [])
        setMetaTitle(data.meta_title ?? '')
        setMetaDescription(data.meta_description ?? '')
        setIsActive(data.is_active)

        // Fetch articles if this is the blog system page
        if (data.slug === 'blog') {
          setLoadingPosts(true)
          const { data: postsData, error: postsError } = await supabase
            .from('blog_posts')
            .select('id, title, slug, image_url, is_active, published_at')
            .order('published_at', { ascending: false })
          
          if (!postsError && postsData) {
            setPosts(postsData)
          }
          setLoadingPosts(false)
        }
      }
      setLoading(false)
    }

    fetchPage()
  }, [id, router])

  const togglePostActiveStatus = async (postId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ is_active: !currentStatus })
      .eq('id', postId)

    if (error) {
      toast.error('Error al actualizar estado: ' + error.message)
    } else {
      toast.success(currentStatus ? 'Artículo ocultado' : 'Artículo publicado')
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, is_active: !currentStatus } : p))
      )
    }
  }

  const deletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`¿Estás seguro de que querés eliminar el artículo "${postTitle}"?`)) {
      return
    }

    const { error } = await supabase.from('blog_posts').delete().eq('id', postId)

    if (error) {
      toast.error('Error al eliminar: ' + error.message)
    } else {
      toast.success('Artículo eliminado')
      setPosts(prev => prev.filter(p => p.id !== postId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !slug.trim()) {
      toast.error('Por favor, completá los campos obligatorios (Título y Slug)')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('custom_pages')
      .update({
        title: title.trim(),
        slug: slug.trim(),
        blocks: blocks,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('Ya existe otra página con este Slug. Elegí uno diferente.')
      } else {
        toast.error('Error al actualizar la página: ' + error.message)
      }
    } else {
      toast.success('Página actualizada con éxito')
      router.push('/admin/paginas')
      router.refresh()
    }
  }

  const filteredPosts = posts.filter(
    p =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(postSearch.toLowerCase())
  )

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

  if (loading) {
    return (
      <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', textAlign: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#C9A85C', margin: '40px auto' }} />
        <p>Cargando datos de la página...</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1400px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      
      {/* Back button */}
      <Link href="/admin/paginas" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Volver a Páginas
      </Link>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: slug === 'blog' ? 'center' : 'flex-start' }}>

        {/* LEFT COLUMN: Editor Form */}
        <div style={{ flex: slug === 'blog' ? '0 1 900px' : '1.2', minWidth: '450px' }}>
          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
              {slug === 'blog' ? 'Administrar Blog' : 'Editar Página Interactiva'}
            </h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              {slug === 'blog' 
                ? 'Gestioná los artículos de tu blog y la información de la sección.' 
                : 'Editá y reordená las secciones y mirá los cambios en vivo.'}
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
                  value={title}
                  onChange={e => setTitle(e.target.value)}
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
                    value={slug}
                    disabled={slug === 'blog'}
                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    style={{ ...inputStyle, paddingLeft: '22px', opacity: slug === 'blog' ? 0.6 : 1, cursor: slug === 'blog' ? 'not-allowed' : 'text' }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '20px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>/</span>
                </div>
              </div>
            </div>

            {/* Visual Blocks Designer / System Page Guard */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
              
              {slug === 'blog' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* System Page info card */}
                  <div style={{
                    background: 'rgba(201, 168, 92, 0.05)',
                    border: '1px solid rgba(201, 168, 92, 0.2)',
                    borderRadius: '12px',
                    padding: '20px',
                    lineHeight: '1.6',
                    color: 'rgba(255,255,255,0.85)'
                  }}>
                    <h4 style={{ margin: '0 0 8px', color: '#C9A85C', fontSize: '13px', fontWeight: '800' }}>ℹ️ PÁGINA DEL SISTEMA: LISTADO DE BLOG</h4>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Esta página renderiza automáticamente la grilla con todos tus artículos de blog publicados. Podés cambiar el título de esta página en el menú superior (por ejemplo, renombrarla como "Novedades"), ajustar sus metadatos SEO o pausar la visualización del enlace en la cabecera desactivando la casilla "Publicar página".
                    </p>
                  </div>

                  {/* Articles Dashboard Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'white' }}>Artículos Escritos</h3>
                    <Link href={`/admin/paginas/${id}/nuevo-articulo`} style={{ textDecoration: 'none' }}>
                      <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#C9A85C', color: '#1a1a1a', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        <Plus size={14} /> Escribir Artículo
                      </button>
                    </Link>
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: 'relative', maxWidth: '360px' }}>
                    <input
                      type="text"
                      placeholder="Buscar notas..."
                      value={postSearch}
                      onChange={e => setPostSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '12px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                  </div>

                  {/* Articles table list */}
                  {loadingPosts ? (
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Cargando artículos del blog...</div>
                  ) : filteredPosts.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '36px',
                      background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)',
                      borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '13px'
                    }}>
                      <BookOpen size={28} style={{ opacity: 0.15, marginBottom: '8px', color: '#C9A85C' }} />
                      <div>{postSearch ? 'No se encontraron artículos.' : 'No tenés artículos de blog creados todavía.'}</div>
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>PORTADA</th>
                            <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>TÍTULO</th>
                            <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>FECHA</th>
                            <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>ESTADO</th>
                            <th style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textAlign: 'right' }}>ACCIONES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPosts.map((post) => (
                            <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '8px 16px' }}>
                                {post.image_url ? (
                                  <img src={post.image_url} alt="" style={{ width: '48px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                ) : (
                                  <div style={{ width: '48px', height: '32px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🥃</div>
                                )}
                              </td>
                              <td style={{ padding: '8px 16px', fontWeight: '600', color: 'white' }}>{post.title}</td>
                              <td style={{ padding: '8px 16px', color: 'rgba(255,255,255,0.5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Calendar size={12} />
                                  {new Date(post.published_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </div>
                              </td>
                              <td style={{ padding: '8px 16px' }}>
                                <span style={{
                                  padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                                  background: post.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                  color: post.is_active ? '#10B981' : '#EF4444',
                                  border: `1px solid ${post.is_active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                                }}>
                                  {post.is_active ? 'PUBLICADO' : 'BORRADOR'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => togglePostActiveStatus(post.id, post.is_active)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px' }}
                                    title={post.is_active ? 'Ocultar artículo' : 'Publicar artículo'}
                                  >
                                    {post.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                  
                                  {post.is_active && (
                                    <Link href={`/blog/${post.slug}`} target="_blank" style={{ color: 'rgba(255,255,255,0.5)', padding: '4px' }} title="Ver artículo público">
                                      <ExternalLink size={14} />
                                    </Link>
                                  )}

                                  <Link href={`/admin/paginas/${id}/editar-articulo/${post.id}`} style={{ color: '#C9A85C', padding: '4px' }} title="Editar">
                                    <Edit2 size={14} />
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => deletePost(post.id, post.title)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800', color: 'white' }}>Secciones de la Página</h3>
                  <BlockEditor 
                    blocks={blocks} 
                    onChange={setBlocks} 
                    activeBlockIndex={activeBlockIndex}
                    setActiveBlockIndex={setActiveBlockIndex}
                  />
                </div>
              )}
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
                disabled={saving}
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
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        {slug !== 'blog' && (
          <div style={{ flex: '1', minWidth: '380px', position: 'sticky', top: '32px' }}>
            <CMSPreview blocks={blocks} pageTitle={title} activeBlockIndex={activeBlockIndex} />
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
