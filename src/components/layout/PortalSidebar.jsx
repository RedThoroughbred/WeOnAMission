import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import {
  Home,
  Users,
  DollarSign,
  FileText,
  Calendar,
  Settings,
  HelpCircle,
  Image,
  LayoutDashboard,
  Shield,
  UserCog,
  FileEdit
} from 'lucide-react'

const navigation = {
  parent: [
    { name: 'Dashboard', href: '/home', icon: Home },
    { name: 'My Students', href: '/students', icon: Users },
    { name: 'Payments', href: '/payments', icon: DollarSign },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Help & FAQ', href: '/help', icon: HelpCircle },
  ],
  student: [
    { name: 'Dashboard', href: '/home', icon: Home },
    { name: 'Trip Memories', href: '/memories', icon: Image },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Help & FAQ', href: '/help', icon: HelpCircle },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Parents', href: '/admin/parents', icon: UserCog },
    { name: 'Users', href: '/admin/users', icon: UserCog },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign },
    { name: 'Documents', href: '/admin/documents', icon: FileText },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Trip Memories', href: '/admin/memories', icon: Image },
    { name: 'Questions', href: '/admin/questions', icon: HelpCircle },
    { name: 'Content', href: '/admin/content', icon: FileEdit },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  superadmin: [
    { name: 'Dashboard', href: '/super-admin', icon: Shield },
    { name: 'Churches', href: '/super-admin/churches', icon: Home },
    { name: 'Users', href: '/super-admin/users', icon: Users },
    { name: 'Settings', href: '/super-admin/settings', icon: Settings },
  ]
}

export default function PortalSidebar({ role = 'parent', isOpen, onClose }) {
  const navItems = navigation[role] || navigation.parent

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-72 bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50 border-r border-gray-200/60 dark:border-gray-700/60 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="h-full overflow-y-auto p-6 space-y-3">
          {navItems.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.href}
              end
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30 scale-[1.02]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md hover:scale-[1.02] active:scale-95"
                )
              }
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/20"
                  )}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Decorative gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
      </aside>
    </>
  )
}
