'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { products, formatPrice } from '@/lib/products';

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1,2,3,4,5].map(n => (
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

export default function ProductGrid({ title = 'Destacados', showAll = true }: { title?: string; showAll?: boolean }) {
  const displayProducts = products.slice(0, 8);

  return (
    <section style={{ padding: '60px 0', background: 'white' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 className="section-title">{title}</h2>
          {showAll && (
            <Link
              href="/productos"
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#8B1A1A',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Ver todo el catálogo →
            </Link>
          )}
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {displayProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="product-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link href={`/productos/${product.slug}`} style={{ textDecoration: 'none' }}>
                <div className="product-card__image-wrap">
                  {/* Badge */}
                  {product.badge && (
                    <span className={`product-card__badge product-card__badge--${product.badge}`}>
                      {product.badge === 'new' ? 'Nuevo' : product.badge === 'sale' ? 'Oferta' : 'Limitado'}
                    </span>
                  )}

                  {/* Out of stock overlay */}
                  {!product.inStock && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}>
                      <span style={{
                        background: '#1E2530',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '6px 14px',
                        borderRadius: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}>
                        Sin Stock
                      </span>
                    </div>
                  )}

                  {/* Placeholder bottle icon */}
                  <div style={{
                    width: '80px',
                    height: '180px',
                    background: 'linear-gradient(180deg, #C9A85C 0%, #8B6914 50%, #5A4009 100%)',
                    borderRadius: '6px 6px 4px 4px',
                    position: 'relative',
                    boxShadow: '4px 4px 20px rgba(0,0,0,0.2)',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '20px',
                      height: '24px',
                      background: '#4A4A4A',
                      borderRadius: '3px 3px 0 0',
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '10px',
                      right: '10px',
                      height: '80px',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.9)', fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px' }}>
                        {product.brand.split(' ').slice(-1)[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="product-card__body">
                  <div className="product-card__brand">{product.brand}</div>
                  <div className="product-card__name">{product.name}</div>
                  <div className="product-card__meta">
                    {product.region} {product.age ? `· ${product.age} años` : ''} · {product.abv}% vol.
                  </div>
                  <StarRating rating={product.rating} />
                  <div style={{ marginTop: '10px' }}>
                    {product.originalPrice && (
                      <span className="product-card__price-old">{formatPrice(product.originalPrice)}</span>
                    )}
                    <span className="product-card__price" style={{ color: product.originalPrice ? '#8B1A1A' : '#1A1A1A' }}>
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </Link>

              <div style={{ padding: '0 14px 14px' }}>
                <button
                  className="product-card__btn"
                  disabled={!product.inStock}
                  style={{ opacity: product.inStock ? 1 : 0.5, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
                >
                  <ShoppingCart size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  {product.inStock ? 'Agregar al carrito' : 'Sin stock'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
