'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import { Check, X, Trash2, Star, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Review {
  id: string
  product_id: string
  customer_name: string
  customer_email: string | null
  rating: number
  title: string | null
  comment: string | null
  photo_url: string | null
  verified_purchase: boolean
  is_approved: boolean
  created_at: string
  products?: { name: string; slug: string }
}

export default function AdminResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('product_reviews')
      .select('*, products(name, slug)')
      .order('created_at', { ascending: false })

    if (filter === 'pending')  q = q.eq('is_approved', false)
    if (filter === 'approved') q = q.eq('is_approved', true)

    const { data } = await q
    setReviews(data ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const approve = async (id: string) => {
    await supabase.from('product_reviews').update({ is_approved: true }).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r))
    toast.success('Reseña aprobada ✓')
  }

  const reject = async (id: string) => {
    await supabase.from('product_reviews').update({ is_approved: false }).eq('id', id)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: false } : r))
    toast.success('Reseña rechazada')
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña permanentemente?')) return
    await supabase.from('product_reviews').delete().eq('id', id)
    setReviews(prev => prev.filter(r => r.id !== id))
    toast.success('Reseña eliminada')
  }

  const filtered = reviews.filter(r =>
    r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.comment ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const pending = reviews.filter(r => !r.is_approved).length

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1100px' }}>
      <Toaster position="top-right" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Reseñas de Clientes</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            {pending > 0 && <span style={{ color: '#F59E0B', fontWeight: '700' }}>{pending} pendientes · </span>}
            {reviews.length} en total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['all', 'pending', 'approved'] as const).map(f => {
          const labels = { all: 'Todas', pending: '⏳ Pendientes', approved: '✓ Aprobadas' }
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              background: filter === f ? '#C9A85C' : 'rgba(255,255,255,0.06)',
              color: filter === f ? '#1a1a1a' : 'rgba(255,255,255,0.6)',
            }}>
              {labels[f]}
            </button>
          )
        })}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar reseña..."
            style={{ width: '100%', padding: '8px 10px 8px 32px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>Cargando reseñas...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>No hay reseñas en esta sección</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(review => (
            <div key={review.id} style={{
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${review.is_approved ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
              borderRadius: '12px', padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} size={13} fill={n <= review.rating ? '#C9A85C' : 'transparent'} stroke={n <= review.rating ? '#C9A85C' : 'rgba(255,255,255,0.2)'} />
                      ))}
                    </div>
                    <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{review.customer_name}</span>
                    {review.verified_purchase && (
                      <span style={{ fontSize: '10px', fontWeight: '700', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>✓ Compra verificada</span>
                    )}
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase',
                      background: review.is_approved ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: review.is_approved ? '#10B981' : '#F59E0B',
                    }}>
                      {review.is_approved ? 'Aprobada' : 'Pendiente'}
                    </span>
                  </div>

                  {/* Product */}
                  {review.products && (
                    <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                      Producto: <span style={{ color: '#C9A85C' }}>{review.products.name}</span>
                    </p>
                  )}

                  {/* Title + comment */}
                  {review.title && <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '14px', color: 'white' }}>{review.title}</p>}
                  {review.comment && <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{review.comment}</p>}

                  {/* Photo */}
                  {review.photo_url && (
                    <img src={review.photo_url} alt="Foto del cliente" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  )}

                  <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
                    {review.customer_email && `${review.customer_email} · `}
                    {format(new Date(review.created_at), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {!review.is_approved && (
                    <button onClick={() => approve(review.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '8px 14px', color: '#10B981', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      <Check size={14} /> Aprobar
                    </button>
                  )}
                  {review.is_approved && (
                    <button onClick={() => reject(review.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '8px 14px', color: '#F59E0B', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                      <X size={14} /> Ocultar
                    </button>
                  )}
                  <button onClick={() => remove(review.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 12px', color: '#EF4444', cursor: 'pointer', fontSize: '12px' }}>
                    <Trash2 size={14} />
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
