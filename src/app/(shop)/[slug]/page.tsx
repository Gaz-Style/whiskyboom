import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import CMSBlocks from '@/components/cms/CMSBlocks'

interface DynamicPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = await params
  
  const supabase = await createSupabaseServerClient()
  const { data: page } = await supabase
    .from('custom_pages')
    .select('title, meta_title, meta_description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!page) {
    return {
      title: 'Página no encontrada | Whiskyboom'
    }
  }

  return {
    title: page.meta_title || `${page.title} | Whiskyboom`,
    description: page.meta_description || 'Descubrí más sobre nuestra tienda y productos de whisky premium.'
  }
}

export default async function StoreDynamicPage({ params }: DynamicPageProps) {
  const { slug } = await params
  
  const supabase = await createSupabaseServerClient()
  const { data: page } = await supabase
    .from('custom_pages')
    .select('title, blocks, updated_at')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!page) {
    notFound()
  }

  return (
    <div style={{
      background: '#12161D',
      minHeight: '80vh',
      color: 'white',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <CMSBlocks blocks={page.blocks || []} />
    </div>
  )
}
