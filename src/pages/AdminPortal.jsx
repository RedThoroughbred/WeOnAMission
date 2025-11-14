import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminPortal() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to admin dashboard
    navigate('/admin/dashboard', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
