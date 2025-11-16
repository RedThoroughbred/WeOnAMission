import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * ProtectedRoute - Ensures user has correct role to access a route
 * @param {string} requiredRole - The role required to access this route
 * @param {React.ReactNode} children - The content to render if authorized
 */
export default function ProtectedRoute({ requiredRole, children }) {
  const { user, userProfile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (!user) {
      // Not logged in - redirect to login
      navigate('/login', { replace: true })
      return
    }

    // Wait for userProfile to load before checking role
    if (!userProfile) {
      return
    }

    // Check role access - use userProfile.role from database
    const userRole = userProfile.role || 'parent'
    console.log('🔒 ProtectedRoute check - Required:', requiredRole, 'User has:', userRole)

    // Super admin can access everything
    if (userRole === 'superadmin') {
      return
    }

    // Check if user has required role
    if (requiredRole === 'superadmin' && userRole !== 'superadmin') {
      console.warn('Access denied: Super admin required')
      navigate('/login', { replace: true })
      return
    }

    if (requiredRole === 'admin' && userRole !== 'admin' && userRole !== 'superadmin') {
      console.warn('Access denied: Admin required, user is:', userRole)
      navigate('/student', { replace: true })
      return
    }

    if (requiredRole === 'parent' && userRole === 'student') {
      console.warn('Access denied: Parent required, user is student')
      navigate('/student', { replace: true })
      return
    }

    if (requiredRole === 'student' && userRole !== 'student') {
      console.warn('Access denied: Student required, user is:', userRole)
      // Redirect to appropriate portal
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (userRole === 'parent') {
        navigate('/parent', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
      return
    }
  }, [user, userProfile, loading, requiredRole, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return children
}
