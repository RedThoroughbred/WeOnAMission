import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import EventsList from '../../components/EventsList'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function ParentEvents() {
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
      // Only show events marked for public display
      const publicEvents = data.filter(e => e.display_on_calendar !== false)
      setEvents(publicEvents)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Events" role="parent">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Upcoming Events</h1>
          {church && <p className="text-gray-600 dark:text-gray-400">Events for {church.name}</p>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{events.length} Event{events.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading events...</p>
              </div>
            ) : (
              <EventsList events={events} canEdit={false} />
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
