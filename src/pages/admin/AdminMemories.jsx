import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui'
import { Image, CheckCircle, XCircle } from 'lucide-react'
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

  const handleApprove = async (memoryId) => {
    try {
      await api.updateMemoryStatus(memoryId, 'approved', churchId)
      await loadMemories()
    } catch (error) {
      console.error('Error approving memory:', error)
      alert('Failed to approve memory')
    }
  }

  const handleReject = async (memoryId) => {
    try {
      await api.updateMemoryStatus(memoryId, 'rejected', churchId)
      await loadMemories()
    } catch (error) {
      console.error('Error rejecting memory:', error)
      alert('Failed to reject memory')
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memories.map((memory) => (
                  <div key={memory.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    {memory.photo_url ? (
                      <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-800">
                        <img
                          src={memory.photo_url}
                          alt={memory.title || 'Trip memory'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', memory.photo_url)
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Image className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {memory.title || 'Untitled'}
                      </h3>
                      {memory.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {memory.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          memory.status === 'approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : memory.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {memory.status}
                        </span>
                        {memory.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(memory.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(memory.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
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
