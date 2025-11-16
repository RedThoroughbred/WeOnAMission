import React from 'react'
import { Button } from './ui'
import { Calendar, Clock, MapPin, Download, Edit, Trash2 } from 'lucide-react'

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

export default function EventsList({ events, canEdit = false, onEdit, onDelete }) {
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

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No events scheduled</p>
      </div>
    )
  }

  return (
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
                {!event.display_on_calendar && canEdit && (
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
              {canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(event)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {canEdit && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(event)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
