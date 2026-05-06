'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const categories = [
  {
    name: 'Single Malt Escocés',
    count: '80+ referencias',
    href: '/productos?categoria=single-malt',
    image: '/cat-single-malt.jpg',
    emoji: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  },
  {
    name: 'Bourbon & Tennessee',
    count: '40+ referencias',
    href: '/productos?categoria=bourbon',
    image: '/cat-bourbon.jpg',
    emoji: '🇺🇸',
  },
  {
    name: 'Blended Escocés',
    count: '35+ referencias',
    href: '/productos?categoria=blended',
    image: '/cat-blended.jpg',
    emoji: '🥃',
  },
  {
    name: 'Whisky Japonés',
    count: '25+ referencias',
    href: '/productos?categoria=japones',
    image: '/cat-japones.jpg',
    emoji: '🇯🇵',
  },
];

export default function CategoryCards() {
  return (
    <section style={{ padding: '60px 0', background: '#F7F7F7' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title centered" style={{ textAlign: 'center' }}>
            Explorá por Categoría
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px', marginTop: '12px' }}>
            Encontrá el whisky perfecto para cada ocasión
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={cat.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="category-card">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="category-card__overlay" />
                  <div className="category-card__content">
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{cat.emoji}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{cat.count}</p>
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
