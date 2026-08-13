'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Plus, Edit2, Trash2, Save, X, GripVertical, Upload, Loader2, Eye, EyeOff } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  emoji: string
  sort_order: number
  image_url: string | null
  is_active?: boolean
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', emoji: '', sort_order: 0, image_url: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const slugify = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id)
    try {
      const ext = file.name.split('.').pop()
      const path = `categories/${Date.now()}.${ext}`

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
        .from('categories')
        .update({ image_url: data.publicUrl })
        .eq('id', id)

      if (dbError) {
        toast.error('Error al actualizar base de datos: ' + dbError.message)
      } else {
        toast.success('Imagen cargada')
        setCategories(prev =>
          prev.map(c => (c.id === id ? { ...c, image_url: data.publicUrl } : c))
        )
      }
    } catch (e: any) {
      toast.error('Error al cargar archivo')
    } finally {
      setUploadingId(null)
    }
  }

  const toggleCategoryActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('categories').update({ is_active: !currentStatus }).eq('id', id)
    if (error) {
      toast.error('Error al guardar: Asegurate de haber corrido la consulta SQL en el panel de Supabase.')
    } else {
      toast.success(!currentStatus ? 'Categoría activa en Home' : 'Categoría oculta del Home')
      setCategories(prev =>
        prev.map(c => (c.id === id ? { ...c, is_active: !currentStatus } : c))
      )
    }
  }

  const saveNew = async () => {
    if (!form.name) return toast.error('El nombre es requerido')
    setSaving(true)
    const { error } = await supabase.from('categories').insert([{ 
      name: form.name,
      slug: form.slug || slugify(form.name),
      emoji: form.emoji || '🥃',
      sort_order: form.sort_order,
      image_url: form.image_url || null,
      is_active: true
    }])
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Categoría creada')
    setForm({ name: '', slug: '', emoji: '', sort_order: 0, image_url: '' })
    setShowNew(false)
    setSaving(false)
    load()
  }

  const saveEdit = async (id: string, data: Partial<Category>) => {
    setSaving(true)
    const { error } = await supabase.from('categories').update(data).eq('id', id)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Categoría actualizada')
    setEditingId(null)
    setSaving(false)
    load()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    await supabase.from('categories').delete().eq('id', id)
    toast.success('Categoría eliminada')
    load()
  }

  const fieldStyle = { padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '13px', outline: 'none' }

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '900px', margin: '0 auto' }}>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Categorías del E-commerce</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Administrá las categorías del catálogo y sus portadas visuales.</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#C9A85C', color: '#1a1a1a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {/* New category form */}
      {showNew && (
        <div style={{ background: 'rgba(201,168,92,0.08)', border: '1px solid rgba(201,168,92,0.2)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: '#C9A85C' }}>Nueva Categoría</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ gridColumn: '1/3' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>NOMBRE *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Single Malt Escocés" style={{ ...fieldStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>EMOJI</label>
              <input value={form.emoji} onChange={e => setForm({ ...form, emoji: e.target.value })} placeholder="🥃" style={{ ...fieldStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>ORDEN</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: +e.target.value })} style={{ ...fieldStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>SLUG</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="single-malt-escoces" style={{ ...fieldStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={saveNew} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#C9A85C', color: '#1a1a1a', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
              <Save size={14} /> Guardar
            </button>
            <button onClick={() => setShowNew(false)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <X size={14} /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Cargando...</div>
        ) : categories.map((cat, idx) => (
          <div key={cat.id} style={{ 
            padding: '16px 20px', 
            borderBottom: idx < categories.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px' 
          }}>
            <GripVertical size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
            
            {/* Category image thumbnail upload zone */}
            <div 
              onClick={() => document.getElementById(`cat-img-${cat.id}`)?.click()}
              style={{
                width: '64px',
                height: '44px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              title="Click para cambiar imagen"
            >
              <input
                type="file"
                id={`cat-img-${cat.id}`}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(cat.id, file)
                }}
              />
              {cat.image_url ? (
                <img src={cat.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Upload size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
              )}
              {uploadingId === cat.id && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: '#C9A85C' }} />
                </div>
              )}
            </div>

            <span style={{ fontSize: '20px', flexShrink: 0 }}>{cat.emoji || '🥃'}</span>

            {editingId === cat.id ? (
              <EditRow cat={cat} onSave={(data) => saveEdit(cat.id, data)} onCancel={() => setEditingId(null)} saving={saving} />
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{cat.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                    /{cat.slug} · orden: {cat.sort_order} · {cat.image_url ? 'Imagen cargada ✅' : 'Sin imagen de portada ⚠️'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleCategoryActive(cat.id, cat.is_active !== false)} 
                    style={{ 
                      background: cat.is_active !== false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                      border: `1px solid ${cat.is_active !== false ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, 
                      borderRadius: '6px', 
                      padding: '6px 10px', 
                      color: cat.is_active !== false ? '#10B981' : '#EF4444', 
                      cursor: 'pointer', 
                      display: 'flex' 
                    }}
                    title={cat.is_active !== false ? 'Ocultar de la portada' : 'Mostrar en la portada'}
                  >
                    {cat.is_active !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button onClick={() => setEditingId(cat.id)} style={{ background: 'rgba(201,168,92,0.1)', border: '1px solid rgba(201,168,92,0.3)', borderRadius: '6px', padding: '6px 10px', color: '#C9A85C', cursor: 'pointer', display: 'flex' }}>
                    <Edit2 size={13} />
                  </button>
                  
                  <button onClick={() => deleteCategory(cat.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', padding: '6px 10px', color: '#EF4444', cursor: 'pointer', display: 'flex' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function EditRow({ cat, onSave, onCancel, saving }: { cat: Category; onSave: (data: Partial<Category>) => void; onCancel: () => void; saving: boolean }) {
  const [data, setData] = useState({ name: cat.name, slug: cat.slug, emoji: cat.emoji, sort_order: cat.sort_order })
  const fieldStyle = { padding: '6px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', fontSize: '13px', outline: 'none' }
  return (
    <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} style={{ ...fieldStyle, flex: 2 }} />
      <input value={data.emoji} onChange={e => setData({ ...data, emoji: e.target.value })} style={{ ...fieldStyle, width: '60px' }} />
      <input type="number" value={data.sort_order} onChange={e => setData({ ...data, sort_order: +e.target.value })} style={{ ...fieldStyle, width: '60px' }} />
      <button onClick={() => onSave(data)} disabled={saving} style={{ background: '#C9A85C', border: 'none', borderRadius: '6px', padding: '6px 12px', color: '#1a1a1a', fontWeight: '700', fontSize: '12px', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
        <Save size={12} /> OK
      </button>
      <button onClick={onCancel} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '6px 8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex' }}>
        <X size={12} />
      </button>
    </div>
  )
}
