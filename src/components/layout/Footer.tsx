import Link from 'next/link';
import { Camera, Globe, Tv2, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  tienda: [
    { label: 'Single Malt Escocés', href: '/productos?categoria=single-malt' },
    { label: 'Blended Escocés', href: '/productos?categoria=blended' },
    { label: 'Bourbon & Tennessee', href: '/productos?categoria=bourbon' },
    { label: 'Whisky Japonés', href: '/productos?categoria=japones' },
    { label: 'Whisky Irlandés', href: '/productos?categoria=irlandes' },
    { label: 'Ediciones Limitadas', href: '/productos?categoria=limitado' },
  ],
  marcas: [
    { label: 'The Macallan', href: '/marcas/macallan' },
    { label: 'Glenfiddich', href: '/marcas/glenfiddich' },
    { label: 'Laphroaig', href: '/marcas/laphroaig' },
    { label: 'Johnnie Walker', href: '/marcas/johnnie-walker' },
    { label: "Jack Daniel's", href: '/marcas/jack-daniels' },
    { label: 'Ver todas', href: '/marcas' },
  ],
  informacion: [
    { label: 'Sobre Nosotros', href: '/nosotros' },
    { label: 'Blog & Catas', href: '/blog' },
    { label: 'Preguntas Frecuentes', href: '/faq' },
    { label: 'Política de Envíos', href: '/envios' },
    { label: 'Devoluciones', href: '/devoluciones' },
    { label: 'Contacto', href: '/contacto' },
  ],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          paddingBottom: '40px',
        }}>
          {/* Brand column */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '4px',
                color: 'white',
                marginBottom: '8px',
              }}>
                WHISKY<span style={{ color: '#C9A85C' }}>BOOM</span>
              </div>
              <div style={{
                fontSize: '9px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '16px',
              }}>
                TIENDA DE WHISKY PREMIUM
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.7', color: 'rgba(255,255,255,0.55)', maxWidth: '240px' }}>
                Especialistas en whiskies raros, premium y de colección. Atención personalizada desde 2015.
              </p>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                <Mail size={14} style={{ color: '#C9A85C', flexShrink: 0 }} />
                <span>ventas@whiskyboom.com.ar</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                <Phone size={14} style={{ color: '#C9A85C', flexShrink: 0 }} />
                <span>+54 11 0000-0000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
                <MapPin size={14} style={{ color: '#C9A85C', flexShrink: 0 }} />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>

            {/* Social */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: <Camera size={18} />, href: 'https://instagram.com/whiskyboom', label: 'Instagram' },
                { icon: <Globe size={18} />, href: 'https://facebook.com/whiskyboom', label: 'Facebook' },
                { icon: <Tv2 size={18} />, href: 'https://youtube.com/whiskyboom', label: 'YouTube' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  style={{
                    color: 'rgba(255,255,255,0.55)',
                    background: 'rgba(255,255,255,0.08)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = '#8B1A1A';
                    (e.currentTarget as HTMLElement).style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)';
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Tienda links */}
          <div>
            <h4 className="footer__heading">Tienda</h4>
            {footerLinks.tienda.map(link => (
              <Link key={link.label} href={link.href} className="footer__link">{link.label}</Link>
            ))}
          </div>

          {/* Marcas links */}
          <div>
            <h4 className="footer__heading">Marcas</h4>
            {footerLinks.marcas.map(link => (
              <Link key={link.label} href={link.href} className="footer__link">{link.label}</Link>
            ))}
          </div>

          {/* Info + Newsletter */}
          <div>
            <h4 className="footer__heading">Información</h4>
            {footerLinks.informacion.map(link => (
              <Link key={link.label} href={link.href} className="footer__link">{link.label}</Link>
            ))}

            <div style={{ marginTop: '24px' }}>
              <h4 className="footer__heading">Newsletter</h4>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>
                Novedades, catas y ofertas exclusivas.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white',
                    fontSize: '13px',
                    borderRadius: '2px',
                    outline: 'none',
                    width: '100%',
                  }}
                />
                <button
                  style={{
                    background: '#8B1A1A',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'background 0.2s',
                  }}
                >
                  Suscribirse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <span>© {new Date().getFullYear()} Whiskyboom. Todos los derechos reservados.</span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>
            🔞 Solo para mayores de 18 años · Beber con moderación
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/privacidad" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '12px' }}>Privacidad</Link>
            <Link href="/terminos" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '12px' }}>Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
