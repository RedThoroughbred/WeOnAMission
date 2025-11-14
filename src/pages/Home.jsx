import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to appropriate portal based on user role
    if (!user) {
      navigate('/login')
      return
    }

    const role = user.user_metadata?.role || 'parent'

    switch (role) {
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
  }, [user, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
