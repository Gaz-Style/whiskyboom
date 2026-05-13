'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

// SVG social icons (Instagram/Facebook/Twitter not in this lucide-react version)
const IgIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
const FbIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const XIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>

const socialLinks = [
  { href: 'https://instagram.com/whiskyboom',  label: 'IG', Icon: IgIcon },
  { href: 'https://facebook.com/whiskyboom',   label: 'FB', Icon: FbIcon },
  { href: 'https://twitter.com/whiskyboom',    label: 'X',  Icon: XIcon  },
]

const navLinks = [
  {
    label: 'Whiskies',
    href: '/productos',
    submenu: [
      { label: 'Single Malt Escocés', href: '/productos?categoria=single-malt' },
      { label: 'Blended Escocés',     href: '/productos?categoria=blended' },
      { label: 'Bourbon & Tennessee', href: '/productos?categoria=bourbon' },
      { label: 'Japonés',             href: '/productos?categoria=japones' },
      { label: 'Irlandés',            href: '/productos?categoria=irlandes' },
      { label: 'Ver Todo',            href: '/productos' },
    ],
  },
  {
    label: 'Marcas',
    href: '/productos',
    submenu: [
      { label: 'The Macallan',  href: '/productos?marca=macallan' },
      { label: 'Glenfiddich',   href: '/productos?marca=glenfiddich' },
      { label: 'Laphroaig',     href: '/productos?marca=laphroaig' },
      { label: 'Johnnie Walker',href: '/productos?marca=johnnie-walker' },
      { label: 'Ver todas',     href: '/productos' },
    ],
  },
  { label: 'Ofertas',   href: '/productos?badge=sale' },
  { label: 'Novedades', href: '/productos?badge=new'  },
  { label: 'Blog',      href: '/blog'      },
  { label: 'Nosotros',  href: '/nosotros'  },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [searchOpen, setSearchOpen]     = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { itemCount, openCart } = useCart()

  const hoverLink = (e: React.MouseEvent<HTMLAnchorElement>, enter: boolean) => {
    const el = e.currentTarget as HTMLElement
    el.style.color = enter ? 'white' : 'rgba(255,255,255,0.85)'
    el.style.borderBottomColor = enter ? '#C9A85C' : 'transparent'
  }

  return (
    <>

      <nav className="navbar">
        {/* Search overlay */}
        {searchOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,37,48,0.97)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <button onClick={() => setSearchOpen(false)} style={{ position: 'absolute', top: '20px', right: '24px', color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '20px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
              ¿Qué whisky estás buscando?
            </p>
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex' }}>
              <input autoFocus type="text" placeholder="Marca, región, añada..."
                style={{ flex: 1, padding: '16px 20px', fontSize: '18px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', borderRight: 'none' }}
              />
              <button style={{ background: '#8B1A1A', border: 'none', padding: '16px 24px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                <Search size={22} />
              </button>
            </div>
          </div>
        )}

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          {/* Top row: Logo + Icons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--gold)', fontSize: '26px', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    WHISKY
                  </span>
                  <span style={{ 
                    color: 'white', 
                    fontSize: '26px', 
                    fontWeight: '500', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase',
                    border: '1.5px solid var(--maroon)',
                    padding: '0 6px',
                  }}>
                    BOOM
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <div style={{ height: '1px', width: '30px', background: 'var(--gold)' }}></div>
                  <span style={{ color: 'var(--gold)', fontSize: '10px', letterSpacing: '1px', fontWeight: '500' }}>
                    BS.AS
                  </span>
                  <div style={{ height: '1px', width: '30px', background: 'var(--gold)' }}></div>
                </div>
              </div>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setSearchOpen(true)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}>
                <Search size={20} />
              </button>
              <Link href="/cuenta" style={{ color: 'white', padding: '8px', display: 'flex' }}>
                <User size={20} />
              </Link>
              {/* Cart with badge */}
              <button onClick={openCart} style={{ color: 'white', padding: '8px', display: 'flex', position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#C9A85C', color: '#1a1a1a', fontSize: '10px', fontWeight: '800', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'cartBadgePop 0.3s ease' }}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {navLinks.map((link) => (
              <div key={link.label} style={{ position: 'relative' }}
                onMouseEnter={() => link.submenu && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link href={link.href}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '14px 18px', transition: 'color 0.2s', borderBottom: '3px solid transparent' }}
                  onMouseEnter={e => hoverLink(e, true)}
                  onMouseLeave={e => hoverLink(e, false)}
                >
                  {link.label}
                  {link.submenu && <ChevronDown size={12} />}
                </Link>

                {link.submenu && activeDropdown === link.label && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', minWidth: '220px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', borderTop: '3px solid #8B1A1A', zIndex: 50 }}>
                    {link.submenu.map(sub => (
                      <Link key={sub.label} href={sub.href}
                        style={{ display: 'block', padding: '10px 18px', fontSize: '13px', color: '#1A1A1A', textDecoration: 'none', borderBottom: '1px solid #F0F0F0', transition: 'all 0.15s' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#F7F7F7'; el.style.color = '#8B1A1A'; el.style.paddingLeft = '24px' }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'white'; el.style.color = '#1A1A1A'; el.style.paddingLeft = '18px' }}
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
          <div style={{ background: '#2A3140', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px' }}>
            {navLinks.map(link => (
              <Link key={link.label} href={link.href}
                style={{ display: 'block', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <style>{`@keyframes cartBadgePop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }`}</style>
    </>
  )
}
