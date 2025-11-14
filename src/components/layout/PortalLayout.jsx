import React, { useState } from 'react'
import PortalHeader from './PortalHeader'
import PortalSidebar from './PortalSidebar'

export default function PortalLayout({ title, role = 'parent', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <main className="lg:pl-64 pt-4">
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
