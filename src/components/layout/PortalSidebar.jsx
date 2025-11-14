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
  Shield
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
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign },
    { name: 'Documents', href: '/admin/documents', icon: FileText },
    { name: 'Events', href: '/admin/events', icon: Calendar },
    { name: 'Trip Memories', href: '/admin/memories', icon: Image },
    { name: 'Questions', href: '/admin/questions', icon: HelpCircle },
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="h-full overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
