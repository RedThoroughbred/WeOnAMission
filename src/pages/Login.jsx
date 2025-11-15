import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui'
import { Input } from '../components/ui'
import { Label } from '../components/ui'
import { Alert, AlertDescription } from '../components/ui'
import { Globe, Mail, Lock, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('🔐 Login attempt started...', { email })

    try {
      const result = await signIn(email, password)
      console.log('✅ Login successful!', result)
      navigate('/home')
    } catch (err) {
      console.error('❌ Login failed:', err)
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 px-4">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-md">
        <div className="animate-fadeInUp">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
              <Globe className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                WeOnAMission
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-primary-100">
                {isSignUp ? 'Join your church mission trip' : 'Sign in to continue'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                      error={error}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      error={error}
                    />
                  </div>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button type="button" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full text-lg py-6"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            {/* Footer */}
            <div className="px-8 pb-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="w-full mt-4 text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                {isSignUp ? 'Sign in instead' : 'Create an account'}
              </button>
            </div>
          </div>

          {/* Help text */}
          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Need help? Contact your church administrator
          </p>
        </div>
      </div>
    </div>
  )
}
