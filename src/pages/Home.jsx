import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, userProfile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return

    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login')
      return
    }

    // Give userProfile 10 seconds to load, then proceed with fallback
    const timeout = setTimeout(() => {
      if (!userProfile) {
        console.warn('⚠️ User profile failed to load after 10s, using fallback to parent portal')
        navigate('/parent')
      }
    }, 10000)

    // If userProfile loads, clear timeout and redirect based on role
    if (userProfile) {
      clearTimeout(timeout)
      console.log('🏠 Home: Redirecting based on role:', userProfile.role)

      const role = userProfile.role || 'parent'

      switch (role) {
        case 'superadmin':
          navigate('/super-admin')
          break
        case 'admin':
          navigate('/admin')
          break
        case 'student':
          navigate('/student')
          break
        case 'parent':
        default:
          navigate('/parent')
          break
      }
    } else {
      console.log('⏳ Waiting for user profile to load...')
    }

    return () => clearTimeout(timeout)
  }, [user, userProfile, loading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
