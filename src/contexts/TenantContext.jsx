import React, { createContext, useState, useEffect } from 'react'
import { getSupabase } from '../lib/config'

export const TenantContext = createContext()

export const TenantProvider = ({ children }) => {
  const [churchId, setChurchId] = useState(null)
  const [church, setChurch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const detectChurch = async () => {
      try {
        // Try to detect church from URL query params or path
        const params = new URLSearchParams(window.location.search)
        const churchParam = params.get('church')
        const pathMatch = window.location.pathname.match(/\/([a-z0-9-]+)/)
        const detectedChurchId = churchParam || pathMatch?.[1]

        if (detectedChurchId) {
          setChurchId(detectedChurchId)

          // Fetch church details
          const sb = getSupabase()
          const { data: churchData } = await sb
            .from('churches')
            .select('*')
            .eq('id', detectedChurchId)
            .single()

          setChurch(churchData)
        } else {
          // No church detected, will need to select one from landing page
          setChurchId(null)
          setChurch(null)
        }
      } catch (err) {
        console.error('Error detecting church:', err)
        setError(err.message)
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
    loading,
    error,
    setChurchContext,
    hasChurch: !!churchId,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
