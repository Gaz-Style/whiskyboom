'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const messages = [
  '🚚 Envío gratuito en compras superiores a $50.000 ARS',
  '🥃 Más de 200 referencias premium en stock',
  '⭐ Expertos en whisky desde 2015 — Atención personalizada',
];

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="announcement-bar" style={{ position: 'relative' }}>
      <span>{messages[index]}</span>
      <button
        onClick={() => setVisible(false)}
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Cerrar aviso"
      >
        <X size={14} />
      </button>
    </div>
  );
}
