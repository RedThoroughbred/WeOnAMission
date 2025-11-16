import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { useTenant } from '../../hooks/useTenant'
import { useNotifications } from '../../hooks/useNotifications'
import { Button } from '../ui'
import { Avatar, AvatarFallback } from '../ui'
import { Globe, Moon, Sun, LogOut, Menu, X, Bell, Settings, Users, GraduationCap, Shield, LayoutDashboard } from 'lucide-react'

export default function PortalHeader({ title, onMenuToggle, menuOpen }) {
  const navigate = useNavigate()
  const { user, userProfile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { currentChurch } = useTenant()
  const { count: notificationCount } = useNotifications()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    console.log('🚪 PortalHeader: Sign out button clicked')
    try {
      await signOut()
      console.log('🚪 PortalHeader: Sign out successful, navigating to /login')
      navigate('/login')
    } catch (err) {
      console.error('🚪 PortalHeader: Sign out error:', err)
      // Navigate to login anyway
      navigate('/login')
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Menu button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center hidden sm:flex shadow-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {currentChurch && (
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {currentChurch.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Theme toggle + Notifications + User menu */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 group"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Notifications - Only show for admins */}
          {(userProfile?.role === 'admin' || userProfile?.role === 'superadmin') && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {notificationCount > 0 && (
                  <>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  </>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {notificationCount} {notificationCount === 1 ? 'item' : 'items'} pending review
                      </p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificationCount > 0 ? (
                        <div className="p-4 space-y-3">
                          <button
                            onClick={() => {
                              navigate('/admin/documents')
                              setShowNotifications(false)
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Documents</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Review and approve uploaded documents</p>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/admin/memories')
                              setShowNotifications(false)
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Pending Memories</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Review trip photos and notes</p>
                          </button>
                          <button
                            onClick={() => {
                              navigate('/admin/questions')
                              setShowNotifications(false)
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Unanswered Questions</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Respond to user questions</p>
                          </button>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">All caught up!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
            >
              <Avatar className="w-9 h-9 ring-2 ring-primary-500/20">
                <AvatarFallback>
                  {getInitials(user?.user_metadata?.full_name || user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 animate-fadeIn overflow-hidden">
                  <div className="p-4 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200/50 dark:border-gray-700/50">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {user?.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    {/* Portal Switcher */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Switch Portal View
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        navigate('/parent')
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Parent Portal
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        navigate('/student')
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      Student Portal
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        navigate('/admin')
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                        <LayoutDashboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      Admin Portal
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        navigate('/super-admin')
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      Super Admin Portal
                    </button>

                    <div className="my-2 h-px bg-gray-200 dark:bg-gray-700"></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        // Navigate to settings
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/50 transition-all mt-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                        <LogOut className="w-4 h-4" />
                      </div>
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
