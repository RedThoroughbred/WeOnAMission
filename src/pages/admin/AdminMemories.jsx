import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import { Image } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function AdminMemories() {
  const { churchId, church } = useTenant()
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (churchId) {
      loadMemories()
    }
  }, [churchId])

  const loadMemories = async () => {
    setLoading(true)
    try {
      const pending = await api.getPendingMemories(churchId)
      const approved = await api.getApprovedMemories(churchId)
      setMemories([...pending, ...approved])
    } catch (error) {
      console.error('Error loading memories:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Trip Memories" role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Trip Memories</h1>
          {church && <p className="text-gray-600 dark:text-gray-400">Managing memories for {church.name}</p>}
        </div>
        <Card>
          <CardHeader><CardTitle>{memories.length} Memories</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : memories.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No memories yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {memories.map((memory) => (
                  <div key={memory.id} className="border p-4 rounded-lg">
                    <p className="font-medium">{memory.title || 'Untitled'}</p>
                    <p className="text-sm text-gray-600">{memory.status}</p>
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
