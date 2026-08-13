'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Calendar, FileText, ExternalLink } from 'lucide-react'

interface CustomPage {
  id: string
  title: string
  slug: string
  is_active: boolean
  updated_at: string
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<CustomPage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadPages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('custom_pages')
      .select('id, title, slug, is_active, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error al cargar páginas: ' + error.message)
    } else {
      setPages(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPages()
  }, [])

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('custom_pages')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      toast.error('Error al actualizar el estado: ' + error.message)
    } else {
      toast.success(currentStatus ? 'Página desactivada' : 'Página activada')
      setPages(prev =>
        prev.map(p => (p.id === id ? { ...p, is_active: !currentStatus } : p))
      )
    }
  }

  const deletePage = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de que querés eliminar la página "${title}"? Esta acción no se puede deshacer.`)) {
      return
    }

    const { error } = await supabase.from('custom_pages').delete().eq('id', id)

    if (error) {
      toast.error('Error al eliminar la página: ' + error.message)
    } else {
      toast.success('Página eliminada')
      setPages(prev => prev.filter(p => p.id !== id))
    }
  }

  const filteredPages = pages.filter(
    p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1000px' }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Páginas Personalizadas</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            Gestioná las páginas institucionales o de información de tu tienda (ej. Nosotros, Términos)
          </p>
        </div>
        <Link href="/admin/paginas/nuevo" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#C9A85C', color: '#1a1a1a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            <Plus size={16} /> Crear Página
          </button>
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative',
        marginBottom: '20px',
        maxWidth: '400px'
      }}>
        <input
          type="text"
          placeholder="Buscar por título o slug..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 38px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}>Cargando páginas...</div>
      ) : filteredPages.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: '12px',
          color: 'rgba(255,255,255,0.4)'
        }}>
          <FileText size={40} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '12px' }} />
          <div>{search ? 'No se encontraron páginas para tu búsqueda.' : 'No tenés páginas creadas todavía.'}</div>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>TÍTULO</th>
                <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>RUTA / SLUG</th>
                <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>ÚLTIMA MODIFICACIÓN</th>
                <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>ESTADO</th>
                <th style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map(page => (
                <tr key={page.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: 'white' }}>{page.title}</td>
                  <td style={{ padding: '16px 20px', color: '#C9A85C', fontFamily: 'monospace' }}>/{page.slug}</td>
                  <td style={{ padding: '16px 20px', color: 'rgba(255,255,255,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                      {new Date(page.updated_at).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: page.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: page.is_active ? '#10B981' : '#EF4444',
                      border: `1px solid ${page.is_active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`
                    }}>
                      {page.is_active ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleActiveStatus(page.id, page.is_active)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', padding: '6px', borderRadius: '4px' }}
                        title={page.is_active ? 'Desactivar página' : 'Activar página'}
                      >
                        {page.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      
                      {page.is_active && (
                        <Link href={`/${page.slug}`} target="_blank" style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', padding: '6px', borderRadius: '4px' }} title="Ver página pública">
                          <ExternalLink size={16} />
                        </Link>
                      )}

                      <Link href={`/admin/paginas/${page.id}`} style={{ color: '#C9A85C', display: 'flex', padding: '6px', borderRadius: '4px' }} title="Editar">
                        <Edit2 size={16} />
                      </Link>

                      <button
                        onClick={() => deletePage(page.id, page.title)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', padding: '6px', borderRadius: '4px' }}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background: rgba(255,255,255,0.01) !important;
        }
      `}</style>
    </div>
  )
}
