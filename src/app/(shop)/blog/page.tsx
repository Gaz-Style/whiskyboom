import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Calendar, BookOpen, Clock, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Blog | Whiskyboom',
  description: 'Guías de cata, notas y últimas novedades sobre el mundo del whisky premium en Argentina.'
}

export default async function BlogListPage() {
  const supabase = await createSupabaseServerClient()

  // Verify if the Blog page is active in custom_pages
  const { data: pageData } = await supabase
    .from('custom_pages')
    .select('is_active')
    .eq('slug', 'blog')
    .single()

  if (!pageData || !pageData.is_active) {
    notFound()
  }

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, image_url, published_at')
    .eq('is_active', true)
    .order('published_at', { ascending: false })

  return (
    <div style={{
      background: 'radial-gradient(circle at top, #1E2530 0%, #12161D 100%)',
      minHeight: '80vh',
      color: 'white',
      fontFamily: 'var(--font-inter, system-ui)',
      padding: '60px 24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A85C' }}>
            Novedades & Conocimiento
          </p>
          <h1 style={{ margin: '0 0 16px', fontSize: '42px', fontWeight: '900', letterSpacing: '-1px' }}>
            El Blog de Whiskyboom
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '15px', maxWidth: '600px', marginInline: 'auto' }}>
            Descubrí notas de cata, secretos de destilado, historias de las marcas más famosas y novedades exclusivas.
          </p>
        </div>

        {/* Grid List */}
        {!posts || posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: '16px',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <BookOpen size={44} style={{ opacity: 0.2, marginBottom: '16px', color: '#C9A85C' }} />
            <p style={{ fontWeight: '700', fontSize: '16px', color: 'white' }}>Sin artículos todavía</p>
            <p style={{ fontSize: '13px', margin: 0 }}>Estamos redactando notas increíbles para vos. ¡Volvé pronto!</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {posts.map((post) => (
              <article
                key={post.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  cursor: 'pointer'
                }}
                className="blog-card-hover"
              >
                {/* Image Cover */}
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block', aspectRatio: '16/9', overflow: 'hidden', position: 'relative', background: '#0b0d12' }}>
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      className="blog-card-img"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>🥃</div>
                  )}
                </Link>

                {/* Content info */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Date & Metadata */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>
                        {new Date(post.published_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      <span>3 min leída</span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                      margin: '0 0 10px',
                      fontSize: '18px',
                      fontWeight: '800',
                      color: 'white',
                      lineHeight: '1.4',
                      transition: 'color 0.2s'
                    }}
                    className="blog-card-title"
                    >
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt Summary */}
                  {post.excerpt && (
                    <p style={{
                      margin: '0 0 20px',
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: '1.6',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {post.excerpt}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link href={`/blog/${post.slug}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#C9A85C',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                    className="blog-card-link"
                    >
                      Leer Artículo <ArrowRight size={13} className="blog-card-arrow" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>

      <style>{`
        .blog-card-hover:hover {
          transform: translateY(-5px);
          border-color: rgba(201, 168, 92, 0.3) !important;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3) !important;
        }
        .blog-card-hover:hover .blog-card-img {
          transform: scale(1.04);
        }
        .blog-card-hover:hover .blog-card-title {
          color: #C9A85C !important;
        }
        .blog-card-link:hover .blog-card-arrow {
          transform: translateX(4px);
        }
        .blog-card-arrow {
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  )
}
