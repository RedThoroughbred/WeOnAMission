import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalLayout from '../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, StatCard, Input, Label, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui'
import Modal, { ModalContent, ModalFooter } from '../components/ui/Modal'
import { Church, Users, Settings, Plus, Edit, Shield, Globe } from 'lucide-react'
import { api } from '../services/api'

export default function SuperAdmin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [churches, setChurches] = useState([])
  const [churchStats, setChurchStats] = useState({})
  const [showAddChurchModal, setShowAddChurchModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    trip_name: '',
    trip_destination: '',
    departure_date: '',
    trip_cost: ''
  })

  useEffect(() => {
    loadChurches()
  }, [])

  const loadChurches = async () => {
    setLoading(true)
    try {
      console.log('🏛️ Loading ALL churches (Super Admin)')
      const data = await api.getAllChurches()
      setChurches(data)

      // Load stats for each church
      const stats = {}
      await Promise.all(
        data.map(async (church) => {
          const churchStat = await api.getChurchStats(church.id)
          stats[church.id] = churchStat
        })
      )
      setChurchStats(stats)

      console.log('✅ Loaded', data.length, 'churches')
    } catch (error) {
      console.error('❌ Error loading churches:', error)
      setChurches([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const churchData = {
        name: formData.name,
        slug: formData.slug,
        trip_name: formData.trip_name,
        trip_destination: formData.trip_destination,
        departure_date: formData.departure_date,
        trip_cost: parseFloat(formData.trip_cost),
        active: true
      }

      await api.createChurch(churchData)
      setShowAddChurchModal(false)
      setFormData({
        name: '',
        slug: '',
        trip_name: '',
        trip_destination: '',
        departure_date: '',
        trip_cost: ''
      })
      await loadChurches()
    } catch (error) {
      console.error('Error creating church:', error)
      alert('Failed to create church: ' + error.message)
    }
  }

  return (
    <PortalLayout title="Super Admin" role="superadmin">
      <div className="space-y-6 animate-fadeInUp">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Super Admin Portal
              </h2>
              <p className="text-indigo-100">
                Manage all churches, users, and platform settings
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowAddChurchModal(true)}
            className="bg-white text-indigo-900 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Church
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total Churches"
            value={churches.length}
            icon={Church}
          />
          <StatCard
            title="Total Users"
            value={Object.values(churchStats).reduce((sum, s) => sum + (s.userCount || 0), 0)}
            icon={Users}
          />
          <StatCard
            title="Total Students"
            value={Object.values(churchStats).reduce((sum, s) => sum + (s.studentCount || 0), 0)}
            icon={Globe}
          />
        </div>

        {/* Churches Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Churches</CardTitle>
            <CardDescription>Manage church instances and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Church Name</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churches.map((church) => (
                  <TableRow key={church.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {church.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          /{church.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{church.trip_name || 'Not set'}</p>
                        <p className="text-xs text-gray-500">{church.trip_destination || 'Not set'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{churchStats[church.id]?.studentCount || 0}</TableCell>
                    <TableCell>{churchStats[church.id]?.userCount || 0}</TableCell>
                    <TableCell>
                      <Badge variant={church.active ? 'success' : 'secondary'}>
                        {church.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Church Modal */}
        <Modal
          isOpen={showAddChurchModal}
          onClose={() => setShowAddChurchModal(false)}
          title="Add New Church"
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <ModalContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name" required>Church Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Trinity Church"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug" required>URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      required
                      placeholder="trinity"
                    />
                    <p className="text-xs text-gray-500 mt-1">weonamission.org/{formData.slug || 'slug'}</p>
                  </div>
                  <div>
                    <Label htmlFor="trip_name" required>Trip Name</Label>
                    <Input
                      id="trip_name"
                      value={formData.trip_name}
                      onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                      required
                      placeholder="Peru 2026"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="trip_destination" required>Destination</Label>
                    <Input
                      id="trip_destination"
                      value={formData.trip_destination}
                      onChange={(e) => setFormData({ ...formData, trip_destination: e.target.value })}
                      required
                      placeholder="Ahuac, Peru"
                    />
                  </div>
                  <div>
                    <Label htmlFor="departure_date" required>Departure Date</Label>
                    <Input
                      id="departure_date"
                      type="date"
                      value={formData.departure_date}
                      onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="trip_cost" required>Trip Cost (per student)</Label>
                    <Input
                      id="trip_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.trip_cost}
                      onChange={(e) => setFormData({ ...formData, trip_cost: e.target.value })}
                      required
                      placeholder="2500.00"
                    />
                  </div>
                </div>
              </div>
            </ModalContent>

            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAddChurchModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Create Church
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}
