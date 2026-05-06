'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  {
    label: 'Whiskies',
    href: '/productos',
    submenu: [
      { label: 'Single Malt Escocés', href: '/productos?categoria=single-malt' },
      { label: 'Blended Escocés', href: '/productos?categoria=blended' },
      { label: 'Bourbon & Tennessee', href: '/productos?categoria=bourbon' },
      { label: 'Japonés', href: '/productos?categoria=japones' },
      { label: 'Irlandés', href: '/productos?categoria=irlandes' },
      { label: 'Ver Todo', href: '/productos' },
    ],
  },
  {
    label: 'Marcas',
    href: '/marcas',
    submenu: [
      { label: 'The Macallan', href: '/marcas/macallan' },
      { label: 'Glenfiddich', href: '/marcas/glenfiddich' },
      { label: 'Laphroaig', href: '/marcas/laphroaig' },
      { label: 'Johnnie Walker', href: '/marcas/johnnie-walker' },
      { label: 'Ver todas', href: '/marcas' },
    ],
  },
  { label: 'Ofertas', href: '/ofertas' },
  { label: 'Destilerías', href: '/destilerias' },
  { label: 'Blog', href: '/blog' },
  { label: 'Nosotros', href: '/nosotros' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartCount] = useState(0);

  return (
    <nav className="navbar">
      {/* Search overlay */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30,37,48,0.97)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            onClick={() => setSearchOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              color: 'white',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={28} />
          </button>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            ¿Qué estás buscando?
          </p>
          <div style={{ width: '100%', maxWidth: '600px', display: 'flex', gap: '0' }}>
            <input
              autoFocus
              type="text"
              placeholder="Buscar whisky, marca, región..."
              style={{
                flex: 1,
                padding: '16px 20px',
                fontSize: '18px',
                border: '2px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none',
                borderRight: 'none',
              }}
            />
            <button
              style={{
                background: '#8B1A1A',
                border: 'none',
                padding: '16px 24px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search size={22} />
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Top row: logo + search + cart */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Mobile menu btn */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                color: 'white',
                fontSize: '26px',
                fontWeight: '800',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                WHISKY<span style={{ color: '#C9A85C' }}>BOOM</span>
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '9px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                marginTop: '2px',
              }}>
                TIENDA DE WHISKY PREMIUM
              </span>
            </div>
          </Link>

          {/* Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{ color: 'rgba(255,255,255,0.75)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', transition: 'color 0.2s' }}
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
            <Link
              href="/cuenta"
              style={{ color: 'rgba(255,255,255,0.75)', padding: '8px', display: 'flex', transition: 'color 0.2s' }}
              aria-label="Mi cuenta"
            >
              <User size={20} />
            </Link>
            <Link
              href="/carrito"
              style={{ color: 'rgba(255,255,255,0.75)', padding: '8px', display: 'flex', position: 'relative', transition: 'color 0.2s' }}
              aria-label="Carrito"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: '#8B1A1A',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '700',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0' }} className="hidden lg:flex">
          {navLinks.map((link) => (
            <div
              key={link.label}
              style={{ position: 'relative' }}
              onMouseEnter={() => link.submenu && setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  padding: '14px 18px',
                  transition: 'color 0.2s',
                  borderBottom: '3px solid transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'white';
                  (e.currentTarget as HTMLElement).style.borderBottomColor = '#C9A85C';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
                  (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
                }}
              >
                {link.label}
                {link.submenu && <ChevronDown size={12} />}
              </Link>

              {/* Dropdown */}
              {link.submenu && activeDropdown === link.label && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  background: 'white',
                  minWidth: '220px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  borderTop: '3px solid #8B1A1A',
                  zIndex: 50,
                }}>
                  {link.submenu.map(sub => (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      style={{
                        display: 'block',
                        padding: '10px 18px',
                        fontSize: '13px',
                        color: '#1A1A1A',
                        textDecoration: 'none',
                        borderBottom: '1px solid #F0F0F0',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = '#F7F7F7';
                        (e.currentTarget as HTMLElement).style.color = '#8B1A1A';
                        (e.currentTarget as HTMLElement).style.paddingLeft = '24px';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'white';
                        (e.currentTarget as HTMLElement).style.color = '#1A1A1A';
                        (e.currentTarget as HTMLElement).style.paddingLeft = '18px';
                      }}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: '#2A3140',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '16px',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                display: 'block',
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
