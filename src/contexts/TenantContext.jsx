import React, { createContext, useState, useEffect } from 'react'
import { getSupabase } from '../lib/config'
import { useAuth } from '../hooks/useAuth'

export const TenantContext = createContext()

// Default Trinity church ID
const DEFAULT_CHURCH_ID = '00000000-0000-0000-0000-000000000001'

export const TenantProvider = ({ children }) => {
  const [churchId, setChurchId] = useState(DEFAULT_CHURCH_ID)
  const [church, setChurch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const detectChurch = async () => {
      try {
        const sb = getSupabase()

        // Try to get church from current user's profile
        const { data: { user } } = await sb.auth.getUser()

        let detectedChurchId = DEFAULT_CHURCH_ID

        if (user) {
          // Get user's church_id from users table
          const { data: userData } = await sb
            .from('users')
            .select('church_id')
            .eq('id', user.id)
            .single()

          if (userData?.church_id) {
            detectedChurchId = userData.church_id
          }
        }

        // Also check URL/localStorage (for multi-church support)
        const params = new URLSearchParams(window.location.search)
        const churchParam = params.get('church')
        const storedChurch = localStorage.getItem('selectedChurch')

        if (churchParam) {
          // Try to get church by slug
          const { data: churchBySlug } = await sb
            .from('churches')
            .select('id')
            .eq('slug', churchParam)
            .single()

          if (churchBySlug) {
            detectedChurchId = churchBySlug.id
            localStorage.setItem('selectedChurch', churchParam)
          }
        } else if (storedChurch) {
          const { data: churchBySlug } = await sb
            .from('churches')
            .select('id')
            .eq('slug', storedChurch)
            .single()

          if (churchBySlug) {
            detectedChurchId = churchBySlug.id
          }
        }

        setChurchId(detectedChurchId)

        // Fetch church details
        const { data: churchData } = await sb
          .from('churches')
          .select('*')
          .eq('id', detectedChurchId)
          .single()

        setChurch(churchData || { id: detectedChurchId, name: 'Trinity Church', slug: 'trinity' })
      } catch (err) {
        console.error('Error detecting church:', err)
        setError(err.message)
        // Set defaults even on error
        setChurchId(DEFAULT_CHURCH_ID)
        setChurch({ id: DEFAULT_CHURCH_ID, name: 'Trinity Church', slug: 'trinity' })
      } finally {
        setLoading(false)
      }
    }

    detectChurch()
  }, [])

  const setChurchContext = async (id) => {
    try {
      setChurchId(id)
      const sb = getSupabase()
      const { data: churchData } = await sb
        .from('churches')
        .select('*')
        .eq('id', id)
        .single()
      setChurch(churchData)
    } catch (err) {
      console.error('Error setting church context:', err)
      setError(err.message)
      throw err
    }
  }

  const value = {
    churchId,
    church,
    currentChurch: church, // Alias for compatibility
    loading,
    error,
    setChurchContext,
    hasChurch: !!churchId,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
