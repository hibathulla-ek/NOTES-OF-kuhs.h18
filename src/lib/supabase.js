import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function hasValidSupabaseConfig(url, anonKey) {
  try {
    const parsedUrl = new URL(url)
    return Boolean(anonKey) && ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

export const supabaseConfigError = 'Supabase environment variables are not configured.'

export const supabase = hasValidSupabaseConfig(supabaseUrl, supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
