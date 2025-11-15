import React from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardContent } from '../../components/ui'
import { Settings } from 'lucide-react'

export default function SuperAdminSettings() {
  return (
    <PortalLayout title="Settings" role="superadmin">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Super Admin settings coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
