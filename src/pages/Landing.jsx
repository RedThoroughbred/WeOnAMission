import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Mission Trip Platform
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Organize student volunteer trips across multiple churches
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary bg-white text-primary-900 hover:bg-gray-100"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary bg-secondary-950 text-white hover:bg-secondary-700"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
