import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

/**
 * Supabase client for use in browser (Client Components).
 * Uses the anon key — respects Row Level Security (RLS).
 * Uses cookies automatically so proxy.ts can read the session.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
