import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Helper para llamadas server-side sin auth
const db = createClient(supabaseUrl, supabaseAnonKey)

export interface Product {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  region: string
  age?: number | null
  abv: number
  volume: number
  price: number
  original_price?: number | null
  image?: string | null
  badge?: 'new' | 'sale' | 'limited' | null
  description?: string
  in_stock: boolean
  is_featured?: boolean
  rating: number
  reviews: number
}

export async function getProducts(filters?: {
  category?: string
  badge?: string
  search?: string
  limit?: number
}): Promise<Product[]> {
  let query = db.from('products').select('*').order('created_at', { ascending: false })
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.badge) query = query.eq('badge', filters.badge)
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`)
  if (filters?.limit) query = query.limit(filters.limit)
  const { data, error } = await query
  if (error) { console.error('getProducts error:', error.message); return [] }
  return data ?? []
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  // Broaden to show featured OR on sale items if needed to fill the grid
  const { data } = await db.from('products')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('original_price', { ascending: false, nullsFirst: false })
    .limit(limit)
  return data ?? []
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  // Show 'new' items first, then most recent items
  const { data } = await db.from('products')
    .select('*')
    .order('badge', { ascending: false }) // 'new' comes before null
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getOnSale(limit = 8): Promise<Product[]> {
  const { data } = await db.from('products').select('*').eq('badge', 'sale').order('created_at', { ascending: false }).limit(limit)
  return data ?? []
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data } = await db.from('products').select('*').eq('slug', slug).single()
  return data ?? null
}

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price)
