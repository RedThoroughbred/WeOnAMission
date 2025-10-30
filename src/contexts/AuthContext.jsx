import React, { createContext, useState, useEffect, useCallback } from 'react'
import { getSupabase } from '../lib/config'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sb = getSupabase()
        const { data: { session } } = await sb.auth.getSession()
        setUser(session?.user || null)

        // Fetch user profile if logged in
        if (session?.user) {
          const { data } = await sb
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUserProfile(data)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const setupAuthListener = async () => {
      const sb = getSupabase()
      const { data: { subscription } } = sb.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user || null)

          if (session?.user) {
            const { data } = await sb
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            setUserProfile(data)
          } else {
            setUserProfile(null)
          }
        }
      )

      return subscription
    }

    let subscription = null
    setupAuthListener().then(sub => {
      subscription = sub
    })

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = useCallback(async (email, password, fullName) => {
    setLoading(true)
    setError(null)
    try {
      const sb = getSupabase()
      const { data, error: authError } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (authError) throw authError
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const sb = getSupabase()
      const { data, error: authError } = await sb.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sb = getSupabase()
      const { error: signOutError } = await sb.auth.signOut()
      if (signOutError) throw signOutError
      setUser(null)
      setUserProfile(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
