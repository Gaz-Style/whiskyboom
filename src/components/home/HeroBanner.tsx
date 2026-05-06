'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function HeroBanner() {
  return (
    <section className="hero" style={{ minHeight: '620px' }}>
      {/* Background image */}
      <Image
        src="/hero.jpg"
        alt="Whiskyboom — Tienda de Whisky Premium"
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        priority
        quality={90}
      />

      {/* Overlay gradient */}
      <div className="hero__overlay" />

      {/* Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', width: '100%', position: 'relative', zIndex: 2 }}>
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              color: '#C9A85C',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ width: '32px', height: '2px', background: '#C9A85C', display: 'inline-block' }} />
            Tienda Especializada en Whisky Premium
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              color: 'white',
              fontSize: 'clamp(32px, 5vw, 64px)',
              fontWeight: '900',
              lineHeight: '1.05',
              letterSpacing: '-1px',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            Los Mejores<br />
            <span style={{ color: '#C9A85C' }}>Whiskies</span><br />
            del Mundo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: '16px',
              lineHeight: '1.7',
              marginBottom: '36px',
              maxWidth: '440px',
            }}
          >
            Más de 200 referencias premium. Single malts escoceses, bourbons americanos, japoneses y ediciones limitadas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
          >
            <Link href="/productos" className="btn-primary">
              Explorar Whiskies <ArrowRight size={16} />
            </Link>
            <Link href="/ofertas" className="btn-outline-white">
              Ver Ofertas
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Breadcrumb decorative */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '32px',
        zIndex: 2,
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '11px',
        letterSpacing: '1px',
        textTransform: 'uppercase',
      }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Inicio</Link>
        <ChevronRight size={12} />
        <span style={{ color: '#C9A85C' }}>Whiskies Premium</span>
      </div>
    </section>
  );
}
