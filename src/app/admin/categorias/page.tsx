'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  emoji: string
  sort_order: number
  image_url?: string
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', emoji: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const slugify = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')

  const saveNew = async () => {
    if (!form.name) return toast.error('El nombre es requerido')
    setSaving(true)
    const { error } = await supabase.from('categories').insert([{ ...form, slug: form.slug || slugify(form.name) }])
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Categoría creada')
    setForm({ name: '', slug: '', emoji: '', sort_order: 0 })
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
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '800px' }}>
      <Toaster position="top-right" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Categorías</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>{categories.length} categorías</p>
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
          <div key={cat.id} style={{ padding: '16px 20px', borderBottom: idx < categories.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GripVertical size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, cursor: 'grab' }} />
            <span style={{ fontSize: '22px', flexShrink: 0 }}>{cat.emoji || '📦'}</span>
            {editingId === cat.id ? (
              <EditRow cat={cat} onSave={(data) => saveEdit(cat.id, data)} onCancel={() => setEditingId(null)} saving={saving} />
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{cat.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>/{cat.slug} · orden: {cat.sort_order}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
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
