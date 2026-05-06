'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="newsletter-section">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div style={{ color: '#C9A85C', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <Mail size={40} />
          </div>
          <h2 style={{
            color: 'white',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '12px',
          }}>
            Suscribite al Club Whiskyboom
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '15px',
            marginBottom: '32px',
            lineHeight: '1.6',
          }}>
            Recibí novedades, ofertas exclusivas, notas de cata y acceso anticipado a ediciones limitadas.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', gap: '0', maxWidth: '480px', margin: '0 auto', flexWrap: 'wrap' }}
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '14px 20px',
                  fontSize: '14px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  outline: 'none',
                  borderRight: 'none',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ borderRadius: '0', padding: '14px 24px' }}
              >
                Suscribirme <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'rgba(201, 168, 92, 0.15)',
                border: '2px solid #C9A85C',
                borderRadius: '4px',
                padding: '20px',
                color: '#C9A85C',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              ✓ ¡Bienvenido al Club! Vas a recibir las mejores novedades.
            </motion.div>
          )}

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '14px' }}>
            Sin spam. Podés darte de baja cuando quieras.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
