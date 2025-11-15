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
        console.log('🔐 Initializing auth...')
        const sb = getSupabase()
        const { data: { session } } = await sb.auth.getSession()
        console.log('🔐 Session:', session ? `exists for ${session.user.email}` : 'none')
        setUser(session?.user || null)

        // Fetch user profile if logged in
        if (session?.user) {
          console.log('🔐 Fetching initial user profile...')

          // Add timeout to prevent hanging
          const profilePromise = sb
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Initial user profile query timeout after 5s')), 5000)
          )

          const result = await Promise.race([profilePromise, timeoutPromise])
            .catch(err => {
              console.error('⚠️ Initial user profile query failed or timed out:', err.message)
              return { data: null, error: err }
            })

          const { data, error } = result

          if (error) {
            console.error('❌ Failed to fetch initial user profile:', error)
            setUserProfile(null)
          } else if (data) {
            console.log('✅ Initial user profile loaded:', data)
            setUserProfile(data)
          } else {
            console.warn('⚠️ No user profile found in database')
            setUserProfile(null)
          }
        }
      } catch (err) {
        console.error('❌ Error initializing auth:', err)
        setError(err.message)
      } finally {
        console.log('🔐 Auth initialization complete')
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const setupAuthListener = async () => {
      const sb = getSupabase()
      const { data: { subscription } } = sb.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔔 Auth state changed:', event, 'Session:', session ? 'exists' : 'null')
          setUser(session?.user || null)

          if (session?.user) {
            console.log('👤 User logged in:', session.user.email)
            console.log('👤 Fetching user profile from database...')

            // Add timeout to prevent hanging
            const profilePromise = sb
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('User profile query timeout after 5s')), 5000)
            )

            const result = await Promise.race([profilePromise, timeoutPromise])
              .catch(err => {
                console.error('⚠️ User profile query failed or timed out:', err.message)
                return { data: null, error: err }
              })

            const { data, error } = result

            if (error) {
              console.error('❌ Failed to fetch user profile:', error)
              setUserProfile(null)
            } else if (data) {
              console.log('✅ User profile loaded:', data)
              setUserProfile(data)
            } else {
              console.warn('⚠️ No user profile found in database for user:', session.user.id)
              setUserProfile(null)
            }
          } else {
            console.log('👤 User logged out')
            setUserProfile(null)
          }
        }
      )

      return subscription
    }

    let subscriptionRef = null

    setupAuthListener().then(sub => {
      subscriptionRef = sub
    }).catch(err => {
      console.error('❌ Failed to setup auth listener:', err)
    })

    return () => {
      if (subscriptionRef) {
        subscriptionRef.unsubscribe()
      }
    }
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
      console.log('🔑 AuthContext: Attempting sign in...')
      const sb = getSupabase()
      console.log('🔑 AuthContext: Supabase client obtained')
      console.log('🔑 AuthContext: Making API call to Supabase...')

      const { data, error: authError } = await sb.auth.signInWithPassword({
        email,
        password
      })

      console.log('🔑 AuthContext: Sign in response received', { data, error: authError })

      if (authError) {
        console.error('🔑 AuthContext: Sign in error:', authError)
        throw authError
      }

      console.log('🔑 AuthContext: Sign in successful!')
      return data
    } catch (err) {
      console.error('🔑 AuthContext: Exception during sign in:', err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    console.log('🚪 Starting sign out...')
    setLoading(true)
    setError(null)
    try {
      const sb = getSupabase()
      console.log('🚪 Calling Supabase signOut...')

      // Add timeout in case Supabase API hangs
      const signOutPromise = sb.auth.signOut()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sign out timeout after 5s')), 5000)
      )

      const { error: signOutError } = await Promise.race([signOutPromise, timeoutPromise])
        .catch(err => {
          console.warn('⚠️ Sign out API call failed or timed out:', err.message)
          return { error: err }
        })

      if (signOutError) {
        console.error('🚪 Sign out error:', signOutError)
      } else {
        console.log('🚪 Sign out API call successful')
      }

      console.log('🚪 Clearing user state regardless of API result...')
      setUser(null)
      setUserProfile(null)
      console.log('✅ Sign out complete!')
    } catch (err) {
      console.error('❌ Sign out failed:', err)
      setError(err.message)
      // Don't throw - still clear local state even if API fails
      setUser(null)
      setUserProfile(null)
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
