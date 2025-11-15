import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, StatCard, Progress } from '../../components/ui'
import { Users, DollarSign, FileText, Image, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { churchId } = useTenant()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalPaid: 0,
    totalCost: 60000, // Default trip cost - should come from church settings
    pendingDocuments: 0,
    pendingMemories: 0,
    upcomingEvents: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (churchId) {
      loadDashboardData()
    }
  }, [churchId])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      console.log('📊 ============ ADMIN DASHBOARD LOADING ============')
      console.log('📊 Church ID being used:', churchId)

      // Get real stats from database
      const statsData = await api.getAdminStats(churchId)

      console.log('📊 Stats returned from API:', JSON.stringify(statsData, null, 2))

      setStats({
        ...statsData,
        totalCost: 60000, // TODO: Get from church settings
      })

      // For now, recent activity is empty until we build an activity log
      setRecentActivity([])

      console.log('✅ Dashboard data loaded successfully')
      console.log('📊 ============================================')
    } catch (error) {
      console.error('❌ ============ ERROR LOADING DASHBOARD ============')
      console.error('❌ Error:', error)
      console.error('❌ Error message:', error.message)
      console.error('❌ Full error details:', JSON.stringify(error, null, 2))
      console.error('❌ ================================================')
    } finally {
      setLoading(false)
    }
  }

  const paymentProgress = (stats.totalPaid / stats.totalCost) * 100

  return (
    <PortalLayout title="Admin Dashboard" role="admin">
      <div className="space-y-6 animate-fadeInUp">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Admin Dashboard 🎯
          </h2>
          <p className="text-primary-100 mb-6">
            Manage your mission trip, students, payments, and more
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/students')}
              className="bg-white text-primary-900 hover:bg-gray-100"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Students
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/documents')}
              className="border-white text-white hover:bg-white/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              Review Documents
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            trend={8}
            trendLabel="vs last month"
          />
          <StatCard
            title="Total Raised"
            value={formatCurrency(stats.totalPaid)}
            icon={DollarSign}
            trend={15}
            trendLabel="vs last month"
          />
          <StatCard
            title="Pending Documents"
            value={stats.pendingDocuments}
            icon={FileText}
          />
          <StatCard
            title="Pending Memories"
            value={stats.pendingMemories}
            icon={Image}
          />
        </div>

        {/* Payment Progress */}
        <Card className="border-l-4 border-l-primary-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Payment Progress</CardTitle>
                <CardDescription>
                  {formatCurrency(stats.totalPaid)} of {formatCurrency(stats.totalCost)} raised
                </CardDescription>
              </div>
              <Badge variant={paymentProgress >= 75 ? 'success' : 'warning'}>
                {Math.round(paymentProgress)}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress
              value={stats.totalPaid}
              max={stats.totalCost}
              variant={paymentProgress >= 75 ? 'success' : paymentProgress >= 50 ? 'warning' : 'default'}
              className="h-3 mb-3"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(stats.totalCost - stats.totalPaid)} remaining to reach goal
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common management tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/admin/students')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Students
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/admin/payments')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Track Payments
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/admin/documents')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Review Documents
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/admin/memories')}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Approve Memories
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/admin/events')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate('/admin/settings')}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                        {activity.type === 'document' && <FileText className="w-4 h-4 text-primary-600" />}
                        {activity.type === 'payment' && <DollarSign className="w-4 h-4 text-green-600" />}
                        {activity.type === 'memory' && <Image className="w-4 h-4 text-purple-600" />}
                        {activity.type === 'student' && <Users className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent activity yet. Activity will appear here as you manage your mission trip.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attention Needed */}
        {(stats.pendingDocuments > 0 || stats.pendingMemories > 0) && (
          <Card className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <CardTitle className="text-amber-900 dark:text-amber-100">
                    Action Required
                  </CardTitle>
                  <div className="text-amber-700 dark:text-amber-300 mt-2">
                    <ul className="list-disc list-inside space-y-1">
                      {stats.pendingDocuments > 0 && (
                        <li>{stats.pendingDocuments} documents awaiting review</li>
                      )}
                      {stats.pendingMemories > 0 && (
                        <li>{stats.pendingMemories} trip memories awaiting approval</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>
    </PortalLayout>
  )
}
