import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { getFeaturedProducts, getNewArrivals, formatPrice, type Product } from '@/lib/products';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={12}
          fill={n <= Math.round(rating) ? '#C9A85C' : 'transparent'}
          stroke={n <= Math.round(rating) ? '#C9A85C' : '#D1D5DB'}
        />
      ))}
      <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '4px' }}>({rating})</span>
    </div>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <div className="product-card" style={{ animationDelay: `${index * 50}ms` }}>
      <Link href={`/productos/${product.slug}`} style={{ textDecoration: 'none' }}>
        <div className="product-card__image-wrap">
          {product.badge && (
            <span className={`product-card__badge product-card__badge--${product.badge}`}>
              {product.badge === 'new' ? 'Nuevo' : product.badge === 'sale' ? 'Oferta' : 'Limitado'}
            </span>
          )}
          {!product.in_stock && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
              <span style={{ background: '#1E2530', color: 'white', fontSize: '12px', fontWeight: '700', padding: '6px 14px', borderRadius: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Sin Stock</span>
            </div>
          )}
          {/* Product image or placeholder */}
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '80px', height: '180px', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '80px', height: '180px', background: 'linear-gradient(180deg, #C9A85C 0%, #8B6914 50%, #5A4009 100%)', borderRadius: '6px 6px 4px 4px', position: 'relative', boxShadow: '4px 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '24px', background: '#4A4A4A', borderRadius: '3px 3px 0 0' }} />
              <div style={{ position: 'absolute', top: '20px', left: '10px', right: '10px', height: '80px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px' }}>
                  {product.brand.split(' ').slice(-1)[0]}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="product-card__body">
          <div className="product-card__brand">{product.brand}</div>
          <div className="product-card__name">{product.name}</div>
          <div className="product-card__meta">
            {product.region} {product.age ? `· ${product.age} años` : ''} · {product.abv}% vol.
          </div>
          <StarRating rating={product.rating} />
          <div style={{ marginTop: '10px' }}>
            {product.original_price && (
              <span className="product-card__price-old">{formatPrice(product.original_price)}</span>
            )}
            <span className="product-card__price" style={{ color: product.original_price ? '#8B1A1A' : '#1A1A1A' }}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </Link>
      <div style={{ padding: '0 14px 14px' }}>
        <button
          className="product-card__btn"
          disabled={!product.in_stock}
          style={{ opacity: product.in_stock ? 1 : 0.5, cursor: product.in_stock ? 'pointer' : 'not-allowed' }}
        >
          <ShoppingCart size={14} style={{ display: 'inline', marginRight: '6px' }} />
          {product.in_stock ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </div>
  );
}

interface ProductGridProps {
  title?: string
  showAll?: boolean
  variant?: 'featured' | 'new'
}

export default async function ProductGrid({ title = 'Destacados', showAll = true, variant = 'featured' }: ProductGridProps) {
  const products = variant === 'new' ? await getNewArrivals(8) : await getFeaturedProducts(8)

  return (
    <section style={{ padding: '60px 0', background: 'white' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 className="section-title">{title}</h2>
          {showAll && (
            <Link href="/productos" style={{ fontSize: '13px', fontWeight: '600', color: '#8B1A1A', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Ver todo el catálogo →
            </Link>
          )}
        </div>
        {products.length === 0 ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px' }}>No hay productos disponibles.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
