import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import { Calendar } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function AdminEvents() {
  const { churchId, church } = useTenant()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (churchId) {
      loadEvents()
    }
  }, [churchId])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const data = await api.getEvents(churchId)
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Event Management" role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Events</h1>
          {church && <p className="text-gray-600 dark:text-gray-400">Managing events for {church.name}</p>}
        </div>
        <Card>
          <CardHeader><CardTitle>{events.length} Events</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No events yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border p-4 rounded-lg">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">{new Date(event.event_date).toLocaleDateString()}</p>
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
