import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '../../components/ui'
import { Users, Edit, Shield, Plus, Trash2 } from 'lucide-react'
import { api } from '../../services/api'

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([])
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'parent',
    church_id: ''
  })

  useEffect(() => {
    loadUsers()
    loadChurches()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      console.log('👥 Loading all users...')
      const data = await api.getAllUsers()
      console.log('👥 Loaded users:', data.length, data)
      setUsers(data)
    } catch (error) {
      console.error('❌ Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChurches = async () => {
    try {
      console.log('⛪ Loading all churches...')
      const data = await api.getAllChurches()
      console.log('⛪ Loaded churches:', data.length, data)
      setChurches(data)
    } catch (error) {
      console.error('❌ Error loading churches:', error)
    }
  }

  const handleAdd = () => {
    setAddForm({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'parent',
      church_id: churches.length > 0 ? churches[0].id : ''
    })
    setShowAddModal(true)
  }

  const handleSaveAdd = async () => {
    if (!addForm.email || !addForm.password || !addForm.full_name) {
      alert('Please fill in all required fields (Name, Email, Password)')
      return
    }

    if (!addForm.church_id) {
      alert('Please select a church')
      return
    }

    try {
      await api.createUser({
        ...addForm,
        church_id: addForm.church_id
      })
      setShowAddModal(false)
      await loadUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user: ' + error.message)
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'parent':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <PortalLayout title="Users" role="superadmin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
              All Users
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage users across all churches
            </p>
          </div>
          <Button onClick={handleAdd} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{users.length} User{users.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No users found</p>
                <Button onClick={handleAdd} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First User
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile: Card view */}
                <div className="grid gap-4 sm:hidden">
                  {users.map((user) => (
                    <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {user.role === 'superadmin' && <Shield className="w-4 h-4 text-purple-600" />}
                            {user.role === 'admin' && <Shield className="w-4 h-4 text-blue-600" />}
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {user.full_name || 'N/A'}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Church:</span>{' '}
                          <span className="text-gray-900 dark:text-white">{user.churches?.name || 'N/A'}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Phone:</span>{' '}
                          <span className="text-gray-900 dark:text-white">{user.phone || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table view */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Church</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Phone</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {user.role === 'superadmin' && <Shield className="w-4 h-4 text-purple-600" />}
                              {user.role === 'admin' && <Shield className="w-4 h-4 text-blue-600" />}
                              <span className="font-medium text-gray-900 dark:text-white">{user.full_name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {user.churches?.name || '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.phone || '-'}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-6">Add New User</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="add_church">Church *</Label>
                  <select
                    id="add_church"
                    value={addForm.church_id}
                    onChange={(e) => setAddForm({ ...addForm, church_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a church</option>
                    {churches.map((church) => (
                      <option key={church.id} value={church.id}>
                        {church.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="add_full_name">Full Name *</Label>
                  <Input
                    id="add_full_name"
                    value={addForm.full_name}
                    onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                    placeholder="User's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="add_email">Email *</Label>
                  <Input
                    id="add_email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="add_password">Password *</Label>
                  <Input
                    id="add_password"
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">User will receive a confirmation email to verify their account</p>
                </div>
                <div>
                  <Label htmlFor="add_phone">Phone</Label>
                  <Input
                    id="add_phone"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="add_role">Role *</Label>
                  <select
                    id="add_role"
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="parent">Parent</option>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleSaveAdd} className="flex-1">
                  Create User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
