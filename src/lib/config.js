import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './supabaseConfig'

// Create Supabase client with hardcoded config
const supabaseInstance = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
)

console.log('✓ Supabase client initialized')

// Test Supabase connectivity
supabaseInstance.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test FAILED:', error)
  } else {
    console.log('✅ Supabase connection test PASSED - server is reachable')
  }
}).catch(err => {
  console.error('❌ Supabase connection test ERROR:', err)
})

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
