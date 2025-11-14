import React, { useState } from 'react'
import PortalHeader from './PortalHeader'
import PortalSidebar from './PortalSidebar'

export default function PortalLayout({ title, role = 'parent', children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-pink-200 dark:bg-pink-900">
      {/* BRIGHT PINK BACKGROUND - IF YOU SEE THIS, THE NEW UI IS WORKING! */}
      <div className="fixed top-0 left-0 right-0 bg-yellow-300 text-black text-center py-4 z-50 font-black text-2xl">
        ⚠️ NEW UI LOADED! If you see this yellow banner, the changes are working! ⚠️
      </div>

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

      <main className="lg:pl-72 pt-24 relative">
        <div className="px-6 sm:px-8 lg:px-12 pb-12 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  )
}
