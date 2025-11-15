import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui'
import { Users, Edit, Shield } from 'lucide-react'
import { api } from '../../services/api'

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
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
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">All Users</h1>
          <Button onClick={loadUsers}>
            Refresh
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
              </div>
            ) : (
              <div className="overflow-x-auto">
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
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
