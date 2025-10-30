import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './supabaseConfig'

// Create Supabase client with hardcoded config
const supabaseInstance = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
)

console.log('✓ Supabase client initialized')

// Also try to use window.CONFIG if available (fallback)
export const getSupabase = () => {
  // Try window.CONFIG first if available (allows for runtime config updates)
  if (window.CONFIG?.supabase?.url && window.CONFIG?.supabase?.anonKey) {
    return createClient(window.CONFIG.supabase.url, window.CONFIG.supabase.anonKey)
  }
  return supabaseInstance
}

export const supabase = supabaseInstance
export const CONFIG = window.CONFIG || SUPABASE_CONFIG
