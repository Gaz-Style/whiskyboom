'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const banners = [
  {
    id: 'ofertas',
    title: 'Grandes Ofertas',
    subtitle: 'Hasta 30% OFF en selección especial',
    cta: 'Ver Ofertas',
    href: '/ofertas',
    image: '/promo-ofertas.jpg',
    dark: true,
  },
  {
    id: 'new',
    title: 'Nuevas Llegadas',
    subtitle: 'Descubrí las últimas incorporaciones',
    cta: 'Ver Novedades',
    href: '/productos?badge=new',
    image: '/cat-single-malt.jpg',
    dark: false,
  },
  {
    id: 'limited',
    title: 'Ediciones Limitadas',
    subtitle: 'Botellas únicas para coleccionistas',
    cta: 'Ver Colección',
    href: '/productos?categoria=limitado',
    image: '/cat-blended.jpg',
    dark: true,
  },
];

export default function PromoBanners() {
  return (
    <section style={{ padding: '48px 0', background: '#F7F7F7' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link href={banner.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="promo-banner" style={{ height: '200px', borderRadius: '4px' }}>
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: banner.dark
                      ? 'linear-gradient(135deg, rgba(30,37,48,0.85) 0%, rgba(30,37,48,0.4) 100%)'
                      : 'linear-gradient(135deg, rgba(139,26,26,0.8) 0%, rgba(30,37,48,0.4) 100%)',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                  }} />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    padding: '28px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}>
                    <h3 style={{
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      marginBottom: '6px',
                    }}>
                      {banner.title}
                    </h3>
                    <p style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: '13px',
                      marginBottom: '16px',
                    }}>
                      {banner.subtitle}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      background: '#C9A85C',
                      color: '#1E2530',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      padding: '6px 14px',
                      borderRadius: '2px',
                      width: 'fit-content',
                    }}>
                      {banner.cta} →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
