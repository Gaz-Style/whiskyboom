'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Star, Package, Filter } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Product {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  original_price: number | null
  badge: string | null
  in_stock: boolean
  is_featured: boolean
  is_top_seller: boolean
  stock_quantity: number | null
  low_stock_threshold: number
  rating: number
  reviews: number
  image: string | null
  region: string
  age: number | null
  abv: number
  created_at: string
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

const badgeColors: Record<string, string> = {
  new: '#10B981', sale: '#F59E0B', limited: '#8B5CF6'
}
const badgeLabels: Record<string, string> = {
  new: 'Nuevo', sale: 'Oferta', limited: 'Limitado'
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterBadge, setFilterBadge] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (filterBadge) query = query.eq('badge', filterBadge)
    if (filterStock === 'in') query = query.eq('in_stock', true)
    if (filterStock === 'out') query = query.eq('in_stock', false)
    const { data } = await query
    setProducts(data ?? [])
    setLoading(false)
  }, [filterBadge, filterStock])

  useEffect(() => { loadProducts() }, [loadProducts])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStock = async (id: string, current: boolean) => {
    await supabase.from('products').update({ in_stock: !current }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, in_stock: !current } : p))
    toast.success(`Stock ${!current ? 'activado' : 'desactivado'}`)
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_featured: !current }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_featured: !current } : p))
    toast.success(`Producto ${!current ? 'destacado' : 'quitado de destacados'}`)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Seguro que querés eliminar este producto? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success('Producto eliminado')
    setDeleting(null)
  }

  return (
    <div style={{ padding: '32px', fontFamily: 'var(--font-inter, system-ui)', color: 'white', maxWidth: '1300px' }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>Productos</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            {filtered.length} de {products.length} productos
          </p>
        </div>
        <Link href="/admin/productos/nuevo" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#C9A85C', color: '#1a1a1a', textDecoration: 'none',
          padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
        }}>
          <Plus size={16} /> Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none',
            }}
          />
        </div>
        <select
          value={filterBadge}
          onChange={e => setFilterBadge(e.target.value)}
          style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
        >
          <option value="">Todos los badges</option>
          <option value="new">Nuevo</option>
          <option value="sale">Oferta</option>
          <option value="limited">Limitado</option>
        </select>
        <select
          value={filterStock}
          onChange={e => setFilterStock(e.target.value)}
          style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '13px', outline: 'none' }}
        >
          <option value="">Todo el stock</option>
          <option value="in">Con stock</option>
          <option value="out">Sin stock</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Cargando productos...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <Package size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            No se encontraron productos
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Producto', 'Categoría', 'Precio', 'Stock', 'Badge', 'Destacado', 'Rating', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr
                  key={product.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Product */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: 'white', maxWidth: '220px' }}>{product.name}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{product.brand} · {product.region}</div>
                  </td>
                  {/* Category */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{product.category}</span>
                  </td>
                  {/* Price */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: '700', color: '#C9A85C', fontSize: '13px' }}>{formatPrice(product.price)}</div>
                    {product.original_price && (
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{formatPrice(product.original_price)}</div>
                    )}
                  </td>
                  {/* Stock toggle + qty */}
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => toggleStock(product.id, product.in_stock)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: product.in_stock ? '#10B981' : '#EF4444', fontSize: '12px', fontWeight: '600' }}
                    >
                      {product.in_stock ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      {product.in_stock ? 'En stock' : 'Sin stock'}
                    </button>
                    {product.stock_quantity !== null && (
                      <div style={{ fontSize: '11px', marginTop: '3px', color: product.stock_quantity <= product.low_stock_threshold ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}>
                        {product.stock_quantity <= product.low_stock_threshold && '⚠ '}
                        {product.stock_quantity} unidades
                      </div>
                    )}
                  </td>
                  {/* Badge */}
                  <td style={{ padding: '14px 16px' }}>
                    {product.badge ? (
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                        background: `${badgeColors[product.badge]}20`, color: badgeColors[product.badge],
                        textTransform: 'uppercase',
                      }}>
                        {badgeLabels[product.badge]}
                      </span>
                    ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>—</span>}
                  </td>
                  {/* Featured */}
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => toggleFeatured(product.id, product.is_featured)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Star size={18} fill={product.is_featured ? '#C9A85C' : 'transparent'} color={product.is_featured ? '#C9A85C' : 'rgba(255,255,255,0.2)'} />
                    </button>
                  </td>
                  {/* Rating */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>⭐ {product.rating} ({product.reviews})</span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/admin/productos/${product.id}`} style={{
                        display: 'flex', alignItems: 'center', padding: '6px 12px',
                        background: 'rgba(201,168,92,0.1)', border: '1px solid rgba(201,168,92,0.3)',
                        borderRadius: '6px', color: '#C9A85C', textDecoration: 'none', fontSize: '12px',
                      }}>
                        <Edit2 size={13} />
                      </Link>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deleting === product.id}
                        style={{
                          display: 'flex', alignItems: 'center', padding: '6px 12px',
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '6px', color: '#EF4444', cursor: 'pointer', fontSize: '12px',
                          opacity: deleting === product.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
