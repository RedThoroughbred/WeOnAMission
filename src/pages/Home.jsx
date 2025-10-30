import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTenant } from '../hooks/useTenant'

export default function Home() {
  const { user, signOut } = useAuth()
  const { church } = useTenant()

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="portal-header px-4 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Home</h1>
            <p className="text-gray-200">{church?.name || 'Loading...'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-primary bg-white text-primary-900 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-fadeIn">
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user?.email}!
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            More content coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
