'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface CategoryItem {
  id: string
  name: string
  emoji: string
  count: string
  href: string
  image: string
}

export default function CategoryCards() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      try {
        // 1. Fetch categories
        const { data: cats, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (catError || !cats) return;

        // 2. Fetch products to calculate exact references count
        const { data: prods } = await supabase
          .from('products')
          .select('category_id');

        const countMap: Record<string, number> = {};
        if (prods) {
          prods.forEach(p => {
            if (p.category_id) {
              countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
            }
          });
        }

        // 3. Map database data to CategoryItem format
        const mapped: CategoryItem[] = cats
          .filter(c => c.is_active !== false)
          .map(c => {
            const count = countMap[c.id] || 0;
            return {
              id: c.id,
              name: c.name,
              emoji: c.emoji || '🥃',
              count: `${count} referencias`,
              href: `/productos?categoria=${c.slug}`,
              image: c.image_url || '/cat-blended.jpg'
            };
          });

        setCategories(mapped);
      } catch (e) {
        console.error('Error fetching category cards:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndCounts();
  }, []);

  if (loading || categories.length === 0) {
    return null; // Hide or display nothing while loading/if empty
  }

  return (
    <section style={{ padding: '60px 0', background: 'transparent' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="section-title centered" style={{ textAlign: 'center' }}>
            Explorá por Categoría
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '12px' }}>
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
              key={cat.id}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={cat.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div className="category-card" style={{ height: '200px', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className="category-card__overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
                  <div className="category-card__content" style={{ position: 'relative', zIndex: 2, padding: '24px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>{cat.emoji}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', color: 'white' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{cat.count}</p>
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
