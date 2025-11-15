import React from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardContent } from '../../components/ui'
import { HelpCircle } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'

export default function AdminQuestions() {
  const { church } = useTenant()

  return (
    <PortalLayout title="Questions" role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Questions</h1>
          {church && <p className="text-gray-600 dark:text-gray-400">Managing questions for {church.name}</p>}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Questions management coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
