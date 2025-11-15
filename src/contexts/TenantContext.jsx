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
        console.log('🏛️ TenantContext: Starting church detection...')
        console.log('🏛️ Default church ID:', DEFAULT_CHURCH_ID)

        if (user) {
          console.log('🏛️ User detected:', user.email, 'User ID:', user.id)
          // Get user's church_id from users table
          const { data: userData, error: userError } = await sb
            .from('users')
            .select('church_id')
            .eq('id', user.id)
            .single()

          console.log('🏛️ User data from database:', userData, 'Error:', userError)

          if (userData?.church_id) {
            detectedChurchId = userData.church_id
            console.log('✅ Using church_id from user profile:', detectedChurchId)
          } else {
            console.log('⚠️ No church_id in user profile, using default:', DEFAULT_CHURCH_ID)
          }
        } else {
          console.log('⚠️ No user logged in, using default church ID')
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

        console.log('🏛️ Final detected church ID:', detectedChurchId)
        setChurchId(detectedChurchId)

        // Fetch church details
        console.log('🏛️ Fetching church details for ID:', detectedChurchId)
        const { data: churchData, error: churchError } = await sb
          .from('churches')
          .select('*')
          .eq('id', detectedChurchId)
          .single()

        console.log('🏛️ Church data from database:', churchData, 'Error:', churchError)

        if (churchData) {
          setChurch(churchData)
          console.log('✅ Church loaded:', churchData.name)
        } else {
          console.log('⚠️ Church not found in database, using fallback')
          setChurch({ id: detectedChurchId, name: 'Trinity Church', slug: 'trinity' })
        }
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
