import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Modal } from '../../components/ui'
import { Calendar, Plus, Edit, Trash2, MapPin, Clock, Download } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'

// Helper function to generate iCal file
const generateICalFile = (event) => {
  const formatDate = (date, time) => {
    const d = new Date(date)
    if (time) {
      const [hours, minutes] = time.split(':')
      d.setHours(parseInt(hours), parseInt(minutes))
    }
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const startDate = formatDate(event.event_date, event.event_time)
  const endDate = formatDate(event.event_date, event.event_time ?
    `${parseInt(event.event_time.split(':')[0]) + 1}:${event.event_time.split(':')[1]}` :
    null)

  const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mission Trip Platform//EN
BEGIN:VEVENT
UID:${event.id}@missiontrip.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.name}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT
END:VCALENDAR`

  return ical
}

const addToCalendar = (event) => {
  const icalContent = generateICalFile(event)

  // Create a data URI that will trigger the calendar app to open
  const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icalContent)

  // Try to open directly in calendar app
  const link = document.createElement('a')
  link.href = dataUri
  link.download = `${event.name.replace(/\s+/g, '_')}.ics`
  link.target = '_blank'

  // Some browsers/OS combinations will open the calendar app directly
  // Others will download the file which can then be opened
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting', color: 'blue' },
  { value: 'deadline', label: 'Deadline', color: 'red' },
  { value: 'activity', label: 'Activity', color: 'green' },
  { value: 'preparation', label: 'Preparation', color: 'purple' },
  { value: 'travel', label: 'Travel', color: 'amber' },
  { value: 'fundraiser', label: 'Fundraiser', color: 'pink' },
  { value: 'other', label: 'Other', color: 'gray' },
]

export default function AdminEvents() {
  const { churchId, church } = useTenant()
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    event_type: 'other',
    display_on_calendar: true
  })

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

  const handleAdd = () => {
    setEditingEvent(null)
    setFormData({
      name: '',
      description: '',
      event_date: '',
      event_time: '',
      location: '',
      event_type: 'other',
      display_on_calendar: true
    })
    setShowModal(true)
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name || '',
      description: event.description || '',
      event_date: event.event_date || '',
      event_time: event.event_time || '',
      location: event.location || '',
      event_type: event.event_type || 'other',
      display_on_calendar: event.display_on_calendar ?? true
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.event_date) {
      alert('Please fill in event name and date')
      return
    }

    try {
      if (editingEvent) {
        await api.updateEvent(editingEvent.id, formData, churchId)
        alert('Event updated!')
      } else {
        await api.createEvent({
          ...formData,
          church_id: churchId,
          created_by: user.id
        })
        alert('Event created!')
      }
      setShowModal(false)
      await loadEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event: ' + error.message)
    }
  }

  const handleDelete = async (event) => {
    if (!confirm(`Delete event "${event.name}"? This cannot be undone.`)) return

    try {
      await api.deleteEvent(event.id, churchId)
      alert('Event deleted!')
      await loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event: ' + error.message)
    }
  }

  const getEventTypeColor = (type) => {
    const eventType = EVENT_TYPES.find(t => t.value === type)
    return eventType ? eventType.color : 'gray'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <PortalLayout title="Event Management" role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Events</h1>
            {church && <p className="text-gray-600 dark:text-gray-400">Managing events for {church.name}</p>}
          </div>
          <Button onClick={handleAdd} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Event
          </Button>
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
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No events yet</p>
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {event.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded bg-${getEventTypeColor(event.event_type)}-100 text-${getEventTypeColor(event.event_type)}-800 dark:bg-${getEventTypeColor(event.event_type)}-900 dark:text-${getEventTypeColor(event.event_type)}-200`}>
                            {EVENT_TYPES.find(t => t.value === event.event_type)?.label || event.event_type}
                          </span>
                          {!event.display_on_calendar && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              Hidden
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          {event.event_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{event.event_time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCalendar(event)}
                          title="Add to Calendar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(event)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Event Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingEvent ? 'Edit Event' : 'Add New Event'}
          size="lg"
        >
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Youth Group Meeting"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_date">Date *</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="event_time">Time</Label>
                  <Input
                    id="event_time"
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Church building, Room 205"
                />
              </div>

              <div>
                <Label htmlFor="event_type">Event Type</Label>
                <select
                  id="event_type"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="display_on_calendar"
                  checked={formData.display_on_calendar}
                  onChange={(e) => setFormData({ ...formData, display_on_calendar: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <Label htmlFor="display_on_calendar" className="mb-0">
                  Display on public calendar
                </Label>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} className="flex-1">
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </PortalLayout>
  )
}
