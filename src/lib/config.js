import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from './supabaseConfig'

// Create Supabase client with hardcoded config
// Add explicit options to ensure proper initialization
const supabaseInstance = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    }
  }
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

// ALWAYS return the same instance to ensure session sharing
export const getSupabase = () => {
  return supabaseInstance
}

export const supabase = supabaseInstance
export const CONFIG = window.CONFIG || SUPABASE_CONFIG
