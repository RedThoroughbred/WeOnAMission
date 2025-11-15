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

    // Wait for user profile to load from database
    if (!userProfile) {
      console.log('⏳ Waiting for user profile to load...')
      return
    }

    console.log('🏠 Home: Redirecting based on role:', userProfile.role)

    // Redirect based on role from database (not user_metadata)
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
  }, [user, userProfile, loading, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
