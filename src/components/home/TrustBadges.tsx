'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, Award, Clock, CreditCard, Phone } from 'lucide-react';

const badges = [
  {
    icon: <Truck size={32} />,
    title: 'Envío a Todo el País',
    desc: 'Gratis en compras +$50.000 ARS',
  },
  {
    icon: <Shield size={32} />,
    title: 'Compra Segura',
    desc: 'Pagos 100% protegidos y encriptados',
  },
  {
    icon: <Award size={32} />,
    title: 'Autenticidad Garantizada',
    desc: 'Solo botellas originales y certificadas',
  },
  {
    icon: <Clock size={32} />,
    title: 'Despacho Rápido',
    desc: 'Procesamos tu pedido en 24hs hábiles',
  },
  {
    icon: <CreditCard size={32} />,
    title: 'Cuotas Sin Interés',
    desc: 'Hasta 12 cuotas con tarjetas seleccionadas',
  },
  {
    icon: <Phone size={32} />,
    title: 'Atención Personalizada',
    desc: 'Expertos disponibles vía WhatsApp',
  },
];

export default function TrustBadges() {
  return (
    <section style={{ padding: '60px 0', background: 'white', borderTop: '1px solid #F0F0F0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              className="trust-badge"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <div style={{ color: '#8B1A1A', marginBottom: '12px' }}>{badge.icon}</div>
              <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: '#1A1A1A' }}>
                {badge.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
