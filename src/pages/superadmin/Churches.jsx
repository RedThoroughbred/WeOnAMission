import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import { Plus, Church } from 'lucide-react'
import { api } from '../../services/api'

export default function SuperAdminChurches() {
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChurches()
  }, [])

  const loadChurches = async () => {
    setLoading(true)
    try {
      const data = await api.getAllChurches()
      setChurches(data)
    } catch (error) {
      console.error('Error loading churches:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Churches" role="superadmin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">All Churches</h1>
          <Button size="lg"><Plus className="w-5 h-5 mr-2" />Add Church</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>{churches.length} Churches</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : churches.length === 0 ? (
              <div className="text-center py-12">
                <Church className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No churches yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {churches.map((church) => (
                  <div key={church.id} className="border p-4 rounded-lg">
                    <p className="font-medium">{church.name}</p>
                    <p className="text-sm text-gray-600">/{church.slug}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
