import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import ResourcesList from '../../components/ResourcesList'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function StudentResources() {
  const { churchId, church } = useTenant()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (churchId) {
      loadResources()
    }
  }, [churchId])

  const loadResources = async () => {
    setLoading(true)
    try {
      const data = await api.getResources(churchId)
      setResources(data)
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Resources" role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Resources</h1>
          {church && <p className="text-gray-600 dark:text-gray-400">Helpful resources for {church.name}</p>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{resources.length} Resource{resources.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resources...</p>
              </div>
            ) : (
              <ResourcesList resources={resources} canEdit={false} />
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
