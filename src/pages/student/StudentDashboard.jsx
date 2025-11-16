import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTenant } from '../../hooks/useTenant'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, StatCard } from '../../components/ui'
import { Image, Calendar, FileText, Heart, Plus, MapPin, Clock } from 'lucide-react'
import { formatDate } from '../../lib/utils'
import { api } from '../../services/api'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { churchId } = useTenant()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    memoriesSubmitted: 0,
    memoriesApproved: 0,
    upcomingEvents: 0,
    documentsComplete: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentMemories, setRecentMemories] = useState([])

  useEffect(() => {
    if (churchId && userProfile) {
      loadDashboardData()
    }
  }, [churchId, userProfile])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load memories for this student user
      const memories = await api.getMemoriesForStudentUser(userProfile.id, churchId)
      const approvedMemories = memories.filter(m => m.status === 'approved')

      // Load events
      const events = await api.getEvents(churchId)
      const publicEvents = events.filter(e => e.display_on_calendar !== false)
      const futureEvents = publicEvents.filter(e => new Date(e.event_date) >= new Date())
      const sortedEvents = futureEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date))

      setStats({
        memoriesSubmitted: memories.length,
        memoriesApproved: approvedMemories.length,
        upcomingEvents: futureEvents.length,
        documentsComplete: 0 // TODO: Get from documents API when available
      })

      setUpcomingEvents(sortedEvents.slice(0, 5)) // Show next 5 events
      setRecentMemories(memories.slice(0, 5)) // Show latest 5 memories
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Student Dashboard" role="student">
      <div className="space-y-6 animate-fadeInUp">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome, {user?.user_metadata?.full_name || 'Student'}! 🌟
          </h2>
          <p className="text-purple-100 mb-6">
            Share your mission trip experiences and create lasting memories
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/student/memories')}
              className="bg-white text-purple-900 hover:bg-gray-100"
            >
              <Image className="w-4 h-4 mr-2" />
              Share Memory
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/student/events')}
              className="border-white text-white hover:bg-white/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Events
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Memories Shared"
            value={stats.memoriesSubmitted}
            icon={Image}
          />
          <StatCard
            title="Approved"
            value={stats.memoriesApproved}
            icon={Heart}
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
          />
          <StatCard
            title="Documents"
            value={stats.documentsComplete}
            icon={FileText}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Memories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Recent Memories</CardTitle>
                <CardDescription>Your latest submissions</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/student/memories')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Memory
              </Button>
            </CardHeader>
            <CardContent>
              {recentMemories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No memories yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/student/memories')}
                  >
                    Share your first memory
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentMemories.map((memory) => (
                    <div
                      key={memory.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Image className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {memory.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(memory.submitted_at)}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={memory.status === 'approved' ? 'success' : 'warning'}
                        className="flex-shrink-0"
                      >
                        {memory.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Don't miss these important dates</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {event.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="default">
                          {event.event_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trip Info Card */}
        <Card className="border-l-4 border-l-purple-600 bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-900 dark:text-purple-100">
              Mission Trip Information
            </CardTitle>
            <CardDescription className="text-purple-700 dark:text-purple-300">
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Destination: Ahuac, Peru</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Departure: June 26, 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Return: July 5, 2026</span>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </PortalLayout>
  )
}
