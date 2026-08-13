import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react'

interface BlogPostDetailProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostDetailProps) {
  const { slug } = await params
  
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!post) {
    return {
      title: 'Artículo no encontrado | Whiskyboom'
    }
  }

  return {
    title: `${post.title} | Blog Whiskyboom`,
    description: post.excerpt || 'Descubrí más sobre el apasionante mundo del whisky premium en nuestro blog.'
  }
}

export default async function BlogPostDetailPage({ params }: BlogPostDetailProps) {
  const { slug } = await params
  
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <div style={{
      background: 'radial-gradient(circle at top, #1E2530 0%, #12161D 100%)',
      minHeight: '80vh',
      color: 'white',
      fontFamily: 'var(--font-inter, system-ui)',
      padding: '40px 24px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Back Link */}
        <Link href="/blog" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'rgba(255, 255, 255, 0.5)',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '32px',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#C9A85C'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
        >
          <ArrowLeft size={16} /> Volver al Blog
        </Link>

        {/* Article Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#C9A85C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
          <span>Destilado & Cultura</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '40px',
          fontWeight: '900',
          lineHeight: '1.2',
          letterSpacing: '-0.5px',
          margin: '0 0 20px',
          color: 'white'
        }}>
          {post.title}
        </h1>

        {/* Date / Reading Time Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.4)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '24px',
          marginBottom: '36px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>
              Publicado el: {new Date(post.published_at).toLocaleDateString('es-AR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} />
            <span>3 minutos de lectura</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.image_url && (
          <div style={{
            width: '100%',
            aspectRatio: '21/9',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '40px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Excerpt Blockquote */}
        {post.excerpt && (
          <div style={{
            borderLeft: '4px solid #C9A85C',
            paddingLeft: '20px',
            fontSize: '18px',
            fontStyle: 'italic',
            lineHeight: '1.6',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '40px'
          }}>
            {post.excerpt}
          </div>
        )}

        {/* Content Body */}
        <div
          className="blog-rich-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#D1D5DB'
          }}
        />

      </div>

      {/* Local typographic styles override */}
      <style>{`
        .blog-rich-content h2 {
          font-size: 24px;
          font-weight: 800;
          color: #C9A85C;
          margin-top: 36px;
          margin-bottom: 14px;
        }
        .blog-rich-content h3 {
          font-size: 19px;
          font-weight: 700;
          color: #ffffff;
          margin-top: 28px;
          margin-bottom: 10px;
        }
        .blog-rich-content p {
          margin-bottom: 24px;
        }
        .blog-rich-content ul, .blog-rich-content ol {
          margin-bottom: 24px;
          padding-left: 24px;
        }
        .blog-rich-content li {
          margin-bottom: 8px;
        }
        .blog-rich-content strong {
          color: #ffffff;
        }
        .blog-rich-content a {
          color: #C9A85C;
          text-decoration: underline;
        }
        .blog-rich-content a:hover {
          color: #ffffff;
        }
      `}</style>
    </div>
  )
}
