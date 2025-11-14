import React, { useState } from 'react'
import PortalHeader from './PortalHeader'
import PortalSidebar from './PortalSidebar'

export default function PortalLayout({ title, role = 'parent', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

      <PortalHeader
        title={title}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        menuOpen={sidebarOpen}
      />

      <PortalSidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="lg:pl-72 pt-8 relative">
        <div className="px-6 sm:px-8 lg:px-12 pb-12 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  )
}
