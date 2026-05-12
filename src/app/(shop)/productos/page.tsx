'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import {
  Search, SlidersHorizontal, X, Star, ShoppingCart,
  ChevronDown, ChevronUp, Package
} from 'lucide-react'

interface Product {
  id: string; slug: string; name: string; brand: string
  category: string; region: string; age: number | null; abv: number
  price: number; original_price: number | null
  image: string | null; badge: string | null
  in_stock: boolean; is_top_seller: boolean
  stock_quantity: number | null; low_stock_threshold: number
  rating: number; reviews: number; is_featured: boolean
}

const PRICE_RANGES = [
  { label: 'Menos de $50.000',         min: 0,      max: 49999  },
  { label: '$50.000 – $100.000',        min: 50000,  max: 99999  },
  { label: '$100.000 – $200.000',       min: 100000, max: 199999 },
  { label: 'Más de $200.000',           min: 200000, max: 999999 },
]

const CATEGORIES = ['Single Malt Escocés','Blended Escocés','Bourbon & Tennessee','Whisky Japonés','Blended Malt','Irish Whiskey','Tennessee Whiskey']
const REGIONS    = ['Speyside','Islay','Highlands','Lowlands','Orkney','Campbeltown','Tennessee, USA','Kentucky, USA','Japón']
const AGES       = [{ label: 'Sin añada', value: 'none' },{ label: '10 años', value: '10' },{ label: '12 años', value: '12' },{ label: '15 años', value: '15' },{ label: '18+ años', value: '18' }]

const SORT_OPTIONS = [
  { label: 'Relevancia',            value: 'relevance'   },
  { label: 'Precio: menor a mayor', value: 'price_asc'   },
  { label: 'Precio: mayor a menor', value: 'price_desc'  },
  { label: 'Más nuevos',            value: 'newest'      },
  { label: 'Mejor rating',          value: 'rating'      },
]

function getBadgeLabel(product: Product): { label: string; color: string; bg: string } | null {
  if (!product.in_stock) return { label: 'AGOTADO', color: '#fff', bg: '#6B7280' }
  if (product.is_top_seller) return { label: '🚀 TOP SELLER', color: '#1a1a1a', bg: '#C9A85C' }
  if (product.stock_quantity !== null && product.stock_quantity <= product.low_stock_threshold && product.in_stock)
    return { label: '⏳ QUEDAN POCOS', color: '#fff', bg: '#F59E0B' }
  if (product.badge === 'limited') return { label: 'LIMITADO', color: '#fff', bg: '#8B5CF6' }
  if (product.badge === 'sale' && product.original_price)
    return { label: `-${Math.round((1 - product.price / product.original_price) * 100)}%`, color: '#fff', bg: '#8B1A1A' }
  if (product.badge === 'new') return { label: 'NUEVO', color: '#1a1a1a', bg: '#C9A85C' }
  return null
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '16px', marginBottom: '16px' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#1a1a1a' }}>
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && children}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={10} fill={n <= Math.round(rating) ? '#C9A85C' : 'transparent'} stroke={n <= Math.round(rating) ? '#C9A85C' : '#D1D5DB'} />
      ))}
    </div>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addItem } = useCart()

  const [products, setProducts]       = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState(searchParams.get('q') ?? '')
  const [sort, setSort]               = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)

  // Active filters
  const [stock,    setStock]    = useState<'all'|'in'|'out'>(searchParams.get('stock') as 'all' | 'in' | 'out' ?? 'all')
  const [badge,    setBadge]    = useState(searchParams.get('badge') ?? '')
  const [cats,     setCats]     = useState<string[]>(searchParams.get('categoria') ? [searchParams.get('categoria')!] : [])
  const [regions,  setRegions]  = useState<string[]>([])
  const [priceIdx, setPriceIdx] = useState<number | null>(null)
  const [onlySale, setOnlySale] = useState(searchParams.get('sale') === 'true')

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('products').select('*')

    if (stock === 'in')  q = q.eq('in_stock', true)
    if (stock === 'out') q = q.eq('in_stock', false)
    if (badge)           q = q.eq('badge', badge)
    if (onlySale)        q = q.eq('badge', 'sale')
    if (cats.length)     q = q.in('category', cats)
    if (regions.length)  q = q.in('region', regions)
    if (priceIdx !== null) {
      const r = PRICE_RANGES[priceIdx]
      q = q.gte('price', r.min).lte('price', r.max)
    }

    if (sort === 'price_asc')  q = q.order('price', { ascending: true })
    else if (sort === 'price_desc') q = q.order('price', { ascending: false })
    else if (sort === 'rating') q = q.order('rating', { ascending: false })
    else q = q.order('created_at', { ascending: false })

    const { data } = await q
    let results = data ?? []

    if (search.trim()) {
      const s = search.toLowerCase()
      results = results.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        (p.category ?? '').toLowerCase().includes(s) ||
        (p.region ?? '').toLowerCase().includes(s)
      )
    }

    setProducts(results)
    setLoading(false)
  }, [stock, badge, cats, regions, priceIdx, sort, onlySale, search])

  useEffect(() => { load() }, [load])

  const activeFiltersCount = [
    stock !== 'all', badge !== '', cats.length > 0,
    regions.length > 0, priceIdx !== null, onlySale
  ].filter(Boolean).length

  const checkStyle = (active: boolean) => ({
    width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
    border: `2px solid ${active ? '#8B1A1A' : '#D1D5DB'}`,
    background: active ? '#8B1A1A' : 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'white', fontFamily: 'var(--font-inter, system-ui)' }}>
      {/* Page header */}
      <div style={{ background: '#F7F4EE', padding: '48px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '24px' }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#8B1A1A' }}>
              Catálogo
            </p>
            <h1 style={{ margin: '0 0 12px', fontSize: '36px', fontWeight: '900', color: '#1a1a1a', lineHeight: 1.1 }}>
              Todos los Whiskies
            </h1>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
              La mejor selección de whisky premium de Argentina
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '48px' }}>🥃</span>
          </div>
        </div>
      </div>

      {/* Discount toggle */}
      <div style={{ background: '#F0EDE6', borderBottom: '1px solid #E5E2D9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => setOnlySale(!onlySale)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: onlySale ? '#8B1A1A' : 'white',
              color: onlySale ? 'white' : '#555',
              border: '1px solid ' + (onlySale ? '#8B1A1A' : '#D1D5DB'),
              padding: '6px 16px', borderRadius: '20px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {onlySale && '✓ '}Productos con descuento
          </button>
          <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
            {loading ? '...' : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* Sidebar filters — desktop */}
        <aside style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Filtros</h2>
            {activeFiltersCount > 0 && (
              <button onClick={() => { setStock('all'); setBadge(''); setCats([]); setRegions([]); setPriceIdx(null); setOnlySale(false) }}
                style={{ fontSize: '11px', color: '#8B1A1A', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>
                Limpiar ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Disponibilidad */}
          <FilterSection title="Disponibilidad">
            {(['all', 'in', 'out'] as const).map((v, i) => {
              const labels = ['Todos', 'En existencia', 'Agotado']
              const active = stock === v
              return (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <div style={checkStyle(active)} onClick={() => setStock(v)}>
                    {active && <X size={10} color="white" />}
                  </div>
                  {labels[i]}
                </label>
              )
            })}
          </FilterSection>

          {/* Precio */}
          <FilterSection title="Precio">
            {PRICE_RANGES.map((r, i) => {
              const active = priceIdx === i
              return (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <div style={checkStyle(active)} onClick={() => setPriceIdx(active ? null : i)}>
                    {active && <X size={10} color="white" />}
                  </div>
                  {r.label}
                </label>
              )
            })}
          </FilterSection>

          {/* Categoría */}
          <FilterSection title="Categoría">
            {CATEGORIES.map(c => {
              const active = cats.includes(c)
              return (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <div style={checkStyle(active)} onClick={() => setCats(toggleArray(cats, c))}>
                    {active && <X size={10} color="white" />}
                  </div>
                  {c}
                </label>
              )
            })}
          </FilterSection>

          {/* Región */}
          <FilterSection title="Región" defaultOpen={false}>
            {REGIONS.map(r => {
              const active = regions.includes(r)
              return (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '13px' }}>
                  <div style={checkStyle(active)} onClick={() => setRegions(toggleArray(regions, r))}>
                    {active && <X size={10} color="white" />}
                  </div>
                  {r}
                </label>
              )
            })}
          </FilterSection>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1 }}>
          {/* Search + Sort bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar whisky, marca, región..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', boxSizing: 'border-box', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#FAFAFA' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><X size={14} /></button>}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', outline: 'none', background: 'white', cursor: 'pointer' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ height: '340px', background: '#F3F4F6', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9CA3AF' }}>
              <Package size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontWeight: '700', fontSize: '16px', color: '#374151', margin: '0 0 8px' }}>Sin resultados</p>
              <p style={{ fontSize: '14px', margin: 0 }}>Probá cambiando los filtros</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {products.map(product => {
                const badge = getBadgeLabel(product)
                const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0
                return (
                  <div
                    key={product.id}
                    style={{ background: 'white', border: '1px solid #F0F0F0', borderRadius: '10px', overflow: 'hidden', position: 'relative', transition: 'all 0.2s', cursor: 'pointer' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
                  >
                    {/* Badge */}
                    {badge && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {badge.label}
                      </div>
                    )}

                    {/* Image */}
                    <Link href={`/productos/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#F9F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', position: 'relative' }}>
                        {!product.in_stock && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ background: '#6B7280', color: 'white', fontSize: '11px', fontWeight: '700', padding: '5px 12px', borderRadius: '2px', textTransform: 'uppercase' }}>Agotado</span>
                          </div>
                        )}
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ maxHeight: '180px', maxWidth: '80%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ width: '55px', height: '150px', background: 'linear-gradient(180deg, #C9A85C 0%, #5A4009 100%)', borderRadius: '5px 5px 3px 3px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', width: '15px', height: '18px', background: '#3A3A3A', borderRadius: '2px 2px 0 0' }} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '12px 14px 8px' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.brand}</p>
                        <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.3 }}>{product.name}</h3>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#9CA3AF' }}>
                          {product.region}{product.age ? ` · ${product.age} años` : ''} · {product.abv}% vol.
                        </p>
                        <StarRating rating={product.rating} />
                        <div style={{ marginTop: '8px' }}>
                          {product.original_price && (
                            <span style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through', marginRight: '6px' }}>{formatPrice(product.original_price)}</span>
                          )}
                          <span style={{ fontSize: '15px', fontWeight: '800', color: product.original_price ? '#8B1A1A' : '#1a1a1a' }}>
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Quick add */}
                    <div style={{ padding: '0 14px 14px' }}>
                      <button
                        disabled={!product.in_stock}
                        onClick={() => product.in_stock && addItem({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: product.price, image: product.image })}
                        style={{
                          width: '100%', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          background: product.in_stock ? '#1E2530' : '#F3F4F6',
                          color: product.in_stock ? 'white' : '#9CA3AF',
                          border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                          cursor: product.in_stock ? 'pointer' : 'not-allowed',
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => { if (product.in_stock) (e.currentTarget as HTMLElement).style.background = '#8B1A1A' }}
                        onMouseLeave={e => { if (product.in_stock) (e.currentTarget as HTMLElement).style.background = '#1E2530' }}
                      >
                        <ShoppingCart size={13} />
                        {product.in_stock ? 'Agregar' : 'Agotado'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Cargando...</div>}>
      <ProductsContent />
    </Suspense>
  )
}
