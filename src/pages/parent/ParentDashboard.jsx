import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTenant } from '../../hooks/useTenant'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Progress, StatCard, Skeleton } from '../../components/ui'
import { Users, DollarSign, FileCheck, Calendar, Plus, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentChurch } = useTenant()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [paymentSummary, setPaymentSummary] = useState(null)
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentDocuments, setRecentDocuments] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      // Simulated data for now
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStudents([
        { id: 1, full_name: 'John Doe', grade: 10 },
        { id: 2, full_name: 'Jane Doe', grade: 12 }
      ])

      setPaymentSummary({
        totalStudents: 2,
        totalPaid: 2500,
        totalCost: 5000,
        balanceDue: 2500
      })

      setUpcomingEvents([
        { id: 1, name: 'Fundraiser Dinner', event_date: '2025-12-01', event_type: 'fundraiser' },
        { id: 2, name: 'Parent Meeting', event_date: '2025-12-15', event_type: 'meeting' }
      ])

      setRecentDocuments([
        { id: 1, file_name: 'Medical Form - John', status: 'approved' },
        { id: 2, file_name: 'Permission Slip - Jane', status: 'pending' }
      ])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentProgress = () => {
    if (!paymentSummary) return 0
    return (paymentSummary.totalPaid / paymentSummary.totalCost) * 100
  }

  const getProgressVariant = (progress) => {
    if (progress >= 75) return 'success'
    if (progress >= 50) return 'warning'
    return 'default'
  }

  if (loading) {
    return (
      <PortalLayout title="Parent Dashboard" role="parent">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout title="Parent Dashboard" role="parent">
      <div className="space-y-6 animate-fadeInUp">
        {/* Welcome Section - SUPER VIBRANT & OBVIOUS */}
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border-4 border-white/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/20 rounded-full -mr-48 -mt-48 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full -ml-32 -mb-32 animate-pulse" />
          <div className="relative">
            <div className="inline-block px-6 py-2 bg-yellow-400 text-gray-900 font-extrabold text-sm rounded-full mb-4 shadow-lg animate-pulse">
              🎉 NEW MODERN UI - COMPLETELY REDESIGNED!
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 drop-shadow-lg">
              Welcome back, {user?.user_metadata?.full_name || 'Parent'}! 👋
            </h2>
            <p className="text-xl text-white/95 mb-8 font-medium">
              Track your students' mission trip progress and manage everything in one place
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/students')}
                className="bg-white text-cyan-600 hover:bg-yellow-400 hover:text-gray-900 shadow-2xl hover:shadow-yellow-400/50 border-0 transform hover:scale-110"
              >
                <Users className="w-6 h-6 mr-2" />
                Manage Students
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/payments')}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-2xl shadow-pink-500/50"
              >
                <DollarSign className="w-6 h-6 mr-2" />
                View Payments
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={paymentSummary?.totalStudents || 0}
            icon={Users}
          />
          <StatCard
            title="Total Paid"
            value={formatCurrency(paymentSummary?.totalPaid || 0)}
            icon={DollarSign}
            trend={12}
            trendLabel="vs last month"
          />
          <StatCard
            title="Balance Due"
            value={formatCurrency(paymentSummary?.balanceDue || 0)}
            icon={TrendingUp}
          />
          <StatCard
            title="Documents"
            value={`${recentDocuments.filter(d => d.status === 'approved').length}/${recentDocuments.length}`}
            icon={FileCheck}
          />
        </div>

        {/* Payment Progress */}
        <Card className="border-l-4 border-l-primary-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Trip Payment Progress</CardTitle>
                <CardDescription>
                  {formatCurrency(paymentSummary?.totalPaid || 0)} of {formatCurrency(paymentSummary?.totalCost || 0)} paid
                </CardDescription>
              </div>
              <Badge variant={getPaymentProgress() >= 75 ? 'success' : 'warning'}>
                {Math.round(getPaymentProgress())}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={paymentSummary?.totalPaid || 0}
              max={paymentSummary?.totalCost || 1}
              variant={getProgressVariant(getPaymentProgress())}
              className="h-3 mb-3"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {paymentSummary?.balanceDue > 0
                ? `${formatCurrency(paymentSummary.balanceDue)} remaining`
                : 'Fully paid! 🎉'}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Students Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Students</CardTitle>
                <CardDescription>Registered for the mission trip</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/students')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Student
              </Button>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No students added yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate('/students')}
                  >
                    Add your first student
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                          {student.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.full_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Grade {student.grade}
                          </p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
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
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {event.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(event.event_date)}
                        </p>
                      </div>
                      <Badge variant="default" className="flex-shrink-0">
                        {event.event_type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Documents */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Documents</CardTitle>
                <CardDescription>Upload and track required documents</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/documents')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {recentDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileCheck className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileCheck className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {doc.file_name}
                        </p>
                      </div>
                      <Badge
                        variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}
                        className="flex-shrink-0 ml-2"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <CardTitle className="text-amber-900 dark:text-amber-100">
                  Getting Started Tips
                </CardTitle>
                <CardDescription className="text-amber-700 dark:text-amber-300 mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Add all students who will be attending the trip</li>
                    <li>Upload required documents (medical forms, permission slips)</li>
                    <li>Track payments and set up a payment schedule</li>
                    <li>Check upcoming events and mark your calendar</li>
                  </ul>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </PortalLayout>
  )
}
