'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { Star, ShoppingCart, Plus, Minus, ChevronDown, ChevronUp, Truck, ArrowLeft, Shield } from 'lucide-react'

interface Product {
  id: string; slug: string; name: string; brand: string
  category: string; region: string; age: number | null; abv: number; volume: number
  price: number; original_price: number | null
  image: string | null; gallery_images: string[]
  badge: string | null; description: string | null
  in_stock: boolean; is_top_seller: boolean
  stock_quantity: number | null; low_stock_threshold: number
  rating: number; reviews: number
  tasting_notes: string | null; pairing: string | null; distillery: string | null
}

interface Review {
  id: string; customer_name: string; rating: number
  title: string | null; comment: string | null; photo_url: string | null
  verified_purchase: boolean; created_at: string
}

interface ShippingZone { province: string; cost: number; days_min: number; days_max: number; is_free_above: number | null }

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} fill={n <= Math.round(rating) ? '#C9A85C' : 'transparent'} stroke={n <= Math.round(rating) ? '#C9A85C' : '#D1D5DB'} />
      ))}
    </div>
  )
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderTop: '1px solid #F0F0F0' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div style={{ paddingBottom: '16px', fontSize: '14px', color: '#555', lineHeight: 1.7 }}>{children}</div>}
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addItem } = useCart()

  const [product, setProduct]   = useState<Product | null>(null)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [shipping, setShipping] = useState<ShippingZone[]>([])
  const [province, setProvince] = useState('')
  const [qty, setQty]           = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded]       = useState(false)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*').eq('slug', slug).single(),
      supabase.from('product_reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false }),
      supabase.from('shipping_zones').select('*').eq('is_active', true).order('province'),
    ]).then(([p, r, s]) => {
      if (!p.data) { setLoading(false); return }
      setProduct(p.data)
      setReviews((r.data ?? []).filter((rv: Review & { product_id: string }) => rv.product_id === p.data!.id))
      setShipping(s.data ?? [])
      setLoading(false)
    })
  }, [slug])

  const handleAddToCart = () => {
    if (!product || !product.in_stock) return
    addItem({ id: product.id, slug: product.slug, name: product.name, brand: product.brand, price: product.price, image: product.image }, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-inter, system-ui)' }}>
      <div style={{ textAlign: 'center', color: '#9CA3AF' }}>Cargando producto...</div>
    </div>
  )

  if (!product) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', fontFamily: 'var(--font-inter, system-ui)' }}>
      <p style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>Producto no encontrado</p>
      <Link href="/productos" style={{ color: '#8B1A1A', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>
    </div>
  )

  const allImages = [product.image, ...(product.gallery_images ?? [])].filter(Boolean) as string[]
  const selectedZone = shipping.find(z => z.province === province)
  const isFreeShipping = selectedZone && product.price >= (selectedZone.is_free_above ?? Infinity)
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0

  return (
    <div style={{ fontFamily: 'var(--font-inter, system-ui)', background: 'white', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px' }}>
        <nav style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Inicio</Link>
          <span>/</span>
          <Link href="/productos" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Whiskies</Link>
          <span>/</span>
          <span style={{ color: '#1a1a1a' }}>{product.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>

        {/* LEFT — Gallery */}
        <div>
          <div style={{ background: '#F9F7F3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '500px', position: 'relative', overflow: 'hidden', marginBottom: '12px' }}>
            {allImages.length > 0 ? (
              <img src={allImages[activeImg]} alt={product.name} style={{ maxHeight: '440px', maxWidth: '85%', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '100px', height: '280px', background: 'linear-gradient(180deg, #C9A85C 0%, #5A4009 100%)', borderRadius: '8px 8px 4px 4px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', width: '22px', height: '28px', background: '#3A3A3A', borderRadius: '3px 3px 0 0' }} />
              </div>
            )}
            {product.badge === 'sale' && discount > 0 && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#8B1A1A', color: 'white', fontWeight: '800', fontSize: '14px', padding: '6px 12px', borderRadius: '6px' }}>
                -{discount}%
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {allImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{ width: '70px', height: '70px', padding: 0, border: `2px solid ${activeImg === i ? '#C9A85C' : '#E5E7EB'}`, borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', background: '#F9F7F3', transition: 'border-color 0.2s' }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#9CA3AF' }}>{product.brand}</p>
          <h1 style={{ margin: '0 0 12px', fontSize: '28px', fontWeight: '900', color: '#1a1a1a', lineHeight: 1.2 }}>{product.name}</h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              {product.rating.toFixed(1)} ({product.reviews} reseñas)
            </span>
          </div>

          {/* Stock badge */}
          {product.is_top_seller && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(201,168,92,0.1)', border: '1px solid rgba(201,168,92,0.3)', color: '#8B6914', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginBottom: '16px' }}>
              🚀 TOP SELLER
            </div>
          )}
          {product.stock_quantity !== null && product.stock_quantity <= product.low_stock_threshold && product.in_stock && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#92400E', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginBottom: '16px' }}>
              ⏳ ¡Solo quedan {product.stock_quantity}!
            </div>
          )}

          {/* Price */}
          <div style={{ marginBottom: '20px' }}>
            {product.original_price && (
              <span style={{ fontSize: '16px', color: '#9CA3AF', textDecoration: 'line-through', marginRight: '10px' }}>{formatPrice(product.original_price)}</span>
            )}
            <span style={{ fontSize: '30px', fontWeight: '900', color: product.original_price ? '#8B1A1A' : '#1a1a1a' }}>
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Qty + Add to cart */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555' }}>
                <Minus size={16} />
              </button>
              <span style={{ padding: '12px 16px', fontSize: '15px', fontWeight: '700', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB', minWidth: '50px', textAlign: 'center' }}>{qty}</span>
              <button onClick={() => setQty(qty + 1)} style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555' }}>
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: added ? '#10B981' : product.in_stock ? '#1E2530' : '#E5E7EB',
                color: product.in_stock ? 'white' : '#9CA3AF',
                border: 'none', borderRadius: '8px', padding: '14px',
                fontSize: '14px', fontWeight: '800', cursor: product.in_stock ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'background 0.3s',
              }}
            >
              <ShoppingCart size={18} />
              {added ? '¡Agregado! ✓' : product.in_stock ? 'Agregar al carrito' : 'Agotado'}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { icon: Truck, text: 'Envío a todo el país' },
              { icon: Shield, text: 'Compra segura' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                <Icon size={14} color="#C9A85C" />
                {text}
              </div>
            ))}
          </div>

          {/* Shipping calculator */}
          <div style={{ background: '#F9F7F3', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} color="#C9A85C" /> Ver costo y tiempo de envío
            </p>
            <select
              value={province} onChange={e => setProvince(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', background: 'white', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">Seleccioná tu provincia</option>
              {[...new Set(shipping.map(z => z.province))].sort().map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {selectedZone && (
              <div style={{ marginTop: '10px', padding: '10px 12px', background: 'white', borderRadius: '6px', border: '1px solid #E5E7EB', fontSize: '13px' }}>
                {isFreeShipping ? (
                  <p style={{ margin: 0, color: '#10B981', fontWeight: '700' }}>✓ ¡Envío GRATIS! Llega en {selectedZone.days_min}–{selectedZone.days_max} días hábiles</p>
                ) : (
                  <div>
                    <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#1a1a1a' }}>{formatPrice(selectedZone.cost)} — {selectedZone.days_min}–{selectedZone.days_max} días hábiles</p>
                    {selectedZone.is_free_above && <p style={{ margin: 0, color: '#9CA3AF', fontSize: '12px' }}>Envío gratis desde {formatPrice(selectedZone.is_free_above)}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Detalles técnicos */}
          <div style={{ marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {[
                  ['Categoría', product.category],
                  ['Región', product.region],
                  product.age ? ['Edad', `${product.age} años`] : null,
                  ['ABV', `${product.abv}%`],
                  ['Volumen', `${product.volume} ml`],
                  product.distillery ? ['Destilería', product.distillery] : null,
                ].filter(Boolean).map(row => (
                  <tr key={row![0]} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '8px 0', color: '#9CA3AF', fontWeight: '600', width: '40%' }}>{row![0]}</td>
                    <td style={{ padding: '8px 0', color: '#1a1a1a', fontWeight: '600' }}>{row![1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Acordeones */}
          {product.description && <Accordion title="Descripción">{product.description}</Accordion>}
          {product.tasting_notes && <Accordion title="Notas de Cata">{product.tasting_notes}</Accordion>}
          {product.pairing && <Accordion title="Maridaje Sugerido">{product.pairing}</Accordion>}
        </div>
      </div>

      {/* Reviews section */}
      <div style={{ background: '#F9F7F3', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 32px', fontSize: '24px', fontWeight: '900', color: '#1a1a1a' }}>
            Reseñas de Clientes {reviews.length > 0 && `(${reviews.length})`}
          </h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Todavía no hay reseñas para este producto. ¡Sé el primero!</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {reviews.map(review => (
                <div key={review.id} style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #F0F0F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <StarRating rating={review.rating} size={13} />
                    {review.verified_purchase && (
                      <span style={{ fontSize: '10px', color: '#10B981', fontWeight: '700', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>✓ Compra verificada</span>
                    )}
                  </div>
                  {review.title && <p style={{ margin: '0 0 4px', fontWeight: '700', fontSize: '14px', color: '#1a1a1a' }}>{review.title}</p>}
                  {review.comment && <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#555', lineHeight: 1.6 }}>{review.comment}</p>}
                  {review.photo_url && <img src={review.photo_url} alt="Foto del cliente" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />}
                  <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>
                    — {review.customer_name} · {new Date(review.created_at).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
