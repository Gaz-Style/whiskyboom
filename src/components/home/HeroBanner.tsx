'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeroData {
  title: string
  subtitle: string
  cta_text: string
  href: string
  image_url: string
  is_active: boolean
}

export default function HeroBanner() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (!error && data) {
          setHero({
            title: data.title,
            subtitle: data.subtitle,
            cta_text: data.cta_text,
            href: data.href,
            image_url: data.image_url || '/hero.jpg',
            is_active: data.is_active
          });
        }
      } catch (e) {
        console.error('Error fetching hero banner:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  // Fallback default structure if DB is still loading or doesn't exist yet
  const displayTitle = hero ? hero.title : 'Los Mejores Whiskies del Mundo';
  const displaySubtitle = hero ? hero.subtitle : 'Más de 200 referencias premium. Single malts escoceses, bourbons americanos, japoneses y ediciones limitadas.';
  const displayCta = hero ? hero.cta_text : 'Explorar Whiskies';
  const displayHref = hero ? hero.href : '/productos';
  const displayImage = hero ? hero.image_url : '/hero.jpg';
  const isActive = hero ? hero.is_active : true;

  if (!isActive && !loading) {
    return null; // Hide completely if turned off from administration panel
  }

  return (
    <section className="hero" style={{ minHeight: '620px', position: 'relative', overflow: 'hidden' }}>
      {/* Background image */}
      <img
        src={displayImage}
        alt="Whiskyboom — Tienda de Whisky Premium"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />

      {/* Overlay gradient */}
      <div className="hero__overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1 }} />

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
            {displayTitle}
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
            {displaySubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
          >
            <Link href={displayHref} className="btn-primary">
              {displayCta} <ArrowRight size={16} />
            </Link>
            <Link href="/productos?badge=sale" className="btn-outline-white">
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
