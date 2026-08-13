import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface CMSBlock {
  type: string
  data: any
}

interface CMSBlocksProps {
  blocks: CMSBlock[]
}

export default function CMSBlocks({ blocks }: CMSBlocksProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px', color: 'rgba(255,255,255,0.4)' }}>
        Esta página no tiene secciones publicadas todavía.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {blocks.map((block, index) => {
        let component = null
        switch (block.type) {
          case 'hero_banner':
            component = <HeroBannerSection data={block.data} />
            break
          case 'text_section':
            component = <TextSection data={block.data} />
            break
          case 'image_gallery':
            component = <ImageGallerySection data={block.data} />
            break
          default:
            component = null
        }
        return (
          <div key={index} id={`preview-block-${index}`} style={{ width: '100%' }}>
            {component}
          </div>
        )
      })}
    </div>
  )
}

/* ==========================================
   SECCIÓN: HERO BANNER (BANNER PRINCIPAL)
   ========================================== */
function HeroBannerSection({ data }: { data: any }) {
  const { title, subtitle, image_url, cta_text, cta_link, dark = true } = data

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: dark
        ? 'linear-gradient(135deg, #12161D 0%, #1A222D 100%)'
        : 'linear-gradient(135deg, #8B1A1A 0%, #300C0C 100%)',
      padding: '80px 24px',
      boxSizing: 'border-box'
    }}>
      {/* Background Image */}
      {image_url && image_url.trim() !== '' && (
        <img
          src={image_url}
          alt={title || ''}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
            zIndex: 1
          }}
        />
      )}

      {/* Content overlay */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '800px',
        textAlign: 'center',
        color: 'white',
        fontFamily: 'var(--font-inter, system-ui)'
      }}>
        {title && (
          <h1 style={{
            fontSize: '44px',
            fontWeight: '900',
            margin: '0 0 16px',
            letterSpacing: '-1px',
            lineHeight: '1.2',
            textTransform: 'uppercase',
            textShadow: '0 4px 12px rgba(0,0,0,0.5)',
            background: 'linear-gradient(to right, #ffffff, #C9A85C)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {title}
          </h1>
        )}

        {subtitle && (
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.85)',
            margin: '0 0 32px',
            lineHeight: '1.6',
            fontWeight: '300',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            {subtitle}
          </p>
        )}

        {cta_text && cta_link && (
          <Link href={cta_link} style={{ textDecoration: 'none' }}>
            <button style={{
              background: '#C9A85C',
              color: '#1a1a1a',
              border: 'none',
              padding: '14px 36px',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, background-color 0.2s',
            }}
            className="hero-cta-btn"
            >
              {cta_text}
            </button>
          </Link>
        )}
      </div>

      <style>{`
        .hero-cta-btn:hover {
          transform: translateY(-2px);
          background-color: #ffffff !important;
        }
      `}</style>
    </section>
  )
}

/* ==========================================
   SECCIÓN: TEXTO ENRIQUECIDO
   ========================================== */
function TextSection({ data }: { data: any }) {
  const { content, label } = data
  const displayLabel = label !== undefined ? label : 'Información'

  return (
    <section style={{
      width: '100%',
      padding: '60px 24px',
      background: 'transparent',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'var(--font-inter, system-ui)',
        color: '#D1D5DB',
        fontSize: '16px',
        lineHeight: '1.8'
      }}>
        {/* Breadcrumb / Label */}
        {displayLabel && displayLabel.trim() !== '' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Sparkles size={14} style={{ color: '#C9A85C' }} />
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#C9A85C'
            }}>
              {displayLabel}
            </span>
          </div>
        )}

        <div
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
      </div>

      <style>{`
        .rich-text-content h2 {
          font-size: 26px;
          font-weight: 800;
          color: #C9A85C;
          margin-top: 36px;
          margin-bottom: 16px;
        }
        .rich-text-content h3 {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 28px;
          margin-bottom: 12px;
        }
        .rich-text-content p {
          margin-bottom: 20px;
        }
        .rich-text-content ul, .rich-text-content ol {
          margin-bottom: 24px;
          padding-left: 24px;
        }
        .rich-text-content li {
          margin-bottom: 8px;
        }
        .rich-text-content strong {
          color: #ffffff;
        }
        .rich-text-content a {
          color: #C9A85C;
          text-decoration: underline;
        }
        .rich-text-content a:hover {
          color: #ffffff;
        }
      `}</style>
    </section>
  )
}

/* ==========================================
   SECCIÓN: GALERÍA DE IMÁGENES
   ========================================== */
function ImageGallerySection({ data }: { data: any }) {
  const { images } = data

  if (!images || !Array.isArray(images) || images.length === 0) {
    return null
  }

  return (
    <section style={{
      width: '100%',
      padding: '40px 24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {images.map((imgUrl, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '4/3',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'transform 0.2s, border-color 0.2s',
              background: 'rgba(255,255,255,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="gallery-image-wrapper"
          >
            {imgUrl && imgUrl.trim() !== '' ? (
              <img
                src={imgUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                className="gallery-image"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.25)' }}>
                <span style={{ fontSize: '24px' }}>🖼️</span>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Espacio para imagen</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .gallery-image-wrapper:hover {
          transform: translateY(-4px);
          border-color: rgba(201, 168, 92, 0.4);
        }
        .gallery-image-wrapper:hover .gallery-image {
          transform: scale(1.05);
        }
      `}</style>
    </section>
  )
}
