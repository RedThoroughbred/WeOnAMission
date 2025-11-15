import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '../../components/ui'
import { Users, Plus, Edit, Trash2, Shield } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function AdminUsers() {
  const { churchId, church } = useTenant()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'parent'
  })
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'parent'
  })

  useEffect(() => {
    if (churchId) {
      loadUsers()
    }
  }, [churchId])

  const loadUsers = async () => {
    setLoading(true)
    try {
      console.log('👥 Loading users for church:', churchId)
      const data = await api.getUsersByChurch(churchId)
      console.log('👥 Loaded users:', data.length, data)
      setUsers(data)
    } catch (error) {
      console.error('❌ Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'parent'
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    try {
      await api.updateUser(editingUser.id, editForm)
      setShowEditModal(false)
      setEditingUser(null)
      await loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const handleAdd = () => {
    setAddForm({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'parent'
    })
    setShowAddModal(true)
  }

  const handleSaveAdd = async () => {
    if (!addForm.email || !addForm.password || !addForm.full_name) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await api.createUser({
        ...addForm,
        church_id: churchId
      })
      setShowAddModal(false)
      await loadUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user: ' + error.message)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their associated data.')) return

    try {
      await api.deleteUser(userId)
      await loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
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
    <PortalLayout title="User Management" role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
              Users
            </h1>
            {church && (
              <p className="text-gray-600 dark:text-gray-400">
                Managing users for {church.name}
              </p>
            )}
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
                <p className="text-gray-600 dark:text-gray-400">No users yet</p>
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
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Phone:</span> {user.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(user)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Phone</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
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
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.phone || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-6">Edit User</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_full_name">Full Name *</Label>
                  <Input
                    id="edit_full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    placeholder="User's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email *</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="user@example.com"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="edit_phone">Phone</Label>
                  <Input
                    id="edit_phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_role">Role *</Label>
                  <select
                    id="edit_role"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="parent">Parent</option>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                  }}
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
