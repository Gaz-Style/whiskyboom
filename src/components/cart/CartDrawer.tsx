'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Clock } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

const RESERVE_SECONDS = 600 // 10 minutos

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n)
}

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => (prev <= 0 ? seconds : prev - 1))
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [seconds])

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0')
  const secs = String(remaining % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemCount } = useCart()
  const timer = useCountdown(RESERVE_SECONDS)

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const FREE_SHIPPING_THRESHOLD = 50000
  const progressPct = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeCart}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 400, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '420px', maxWidth: '100vw',
          background: '#FFFFFF',
          zIndex: 401,
          display: 'flex', flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #F0F0F0',
          background: '#1E2530',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#C9A85C" />
            <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
              Tu Carrito
            </span>
            {itemCount > 0 && (
              <span style={{
                background: '#C9A85C', color: '#1a1a1a',
                fontSize: '11px', fontWeight: '800',
                padding: '2px 8px', borderRadius: '12px',
              }}>
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex', padding: '4px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Urgency timer — shown when cart has items */}
        {items.length > 0 && (
          <div style={{
            background: 'rgba(201,168,92,0.1)',
            borderBottom: '1px solid rgba(201,168,92,0.2)',
            padding: '10px 24px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Clock size={14} color="#C9A85C" />
            <span style={{ fontSize: '12px', color: '#8B6914', fontWeight: '600' }}>
              Productos reservados por <strong>{timer}</strong> ⏰
            </span>
          </div>
        )}

        {/* Shipping progress bar */}
        {items.length > 0 && (
          <div style={{ padding: '12px 24px', background: '#F9F9F9', borderBottom: '1px solid #F0F0F0' }}>
            {remaining > 0 ? (
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#555' }}>
                Te faltan <strong style={{ color: '#8B1A1A' }}>{formatPrice(remaining)}</strong> para envío gratis 🚚
              </p>
            ) : (
              <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#10B981', fontWeight: '700' }}>
                ✓ ¡Conseguiste envío gratis!
              </p>
            )}
            <div style={{ height: '4px', background: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #C9A85C, #8B1A1A)',
                borderRadius: '2px', transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: items.length > 0 ? '0' : '0' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center' }}>
              <ShoppingBag size={56} color="#E5E7EB" style={{ marginBottom: '16px' }} />
              <p style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a', margin: '0 0 8px' }}>Tu carrito está vacío</p>
              <p style={{ color: '#9CA3AF', fontSize: '13px', margin: '0 0 24px' }}>Explorá nuestra selección de whiskies premium</p>
              <button
                onClick={closeCart}
                style={{
                  background: '#1E2530', color: 'white', border: 'none',
                  padding: '12px 24px', borderRadius: '6px', fontWeight: '700',
                  fontSize: '13px', cursor: 'pointer', letterSpacing: '0.5px',
                }}
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            <div>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: '14px', padding: '16px 24px',
                  borderBottom: '1px solid #F0F0F0', alignItems: 'flex-start',
                }}>
                  {/* Image */}
                  <div style={{
                    width: '70px', height: '90px', flexShrink: 0,
                    background: '#F7F7F7', borderRadius: '6px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '30px', height: '70px', background: 'linear-gradient(180deg, #C9A85C, #5A4009)', borderRadius: '3px' }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.brand}</p>
                    <Link href={`/productos/${item.slug}`} onClick={closeCart} style={{ textDecoration: 'none' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '600', color: '#1a1a1a', lineHeight: 1.3 }}>{item.name}</p>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty selector */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ padding: '4px 12px', fontSize: '13px', fontWeight: '600', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price */}
                      <span style={{ fontWeight: '800', fontSize: '14px', color: '#8B1A1A' }}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D1D5DB', padding: '2px', display: 'flex', flexShrink: 0 }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '2px solid #F0F0F0', padding: '20px 24px', background: 'white' }}>
            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#555', fontSize: '14px' }}>Subtotal</span>
              <span style={{ fontWeight: '700', fontSize: '16px', color: '#1a1a1a' }}>{formatPrice(subtotal)}</span>
            </div>
            <p style={{ margin: '0 0 16px', color: '#9CA3AF', fontSize: '11px' }}>
              Envío calculado al finalizar la compra
            </p>

            {/* CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg, #8B1A1A, #C9A85C)',
                color: 'white', textDecoration: 'none',
                borderRadius: '8px', fontWeight: '800', fontSize: '15px',
                letterSpacing: '0.5px', textTransform: 'uppercase',
              }}
            >
              Finalizar Pedido <ArrowRight size={18} />
            </Link>
            <button
              onClick={closeCart}
              style={{
                width: '100%', padding: '11px', marginTop: '8px',
                background: 'none', border: '1px solid #E5E7EB',
                borderRadius: '8px', color: '#555', fontSize: '13px',
                cursor: 'pointer', fontWeight: '600',
              }}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  )
}
