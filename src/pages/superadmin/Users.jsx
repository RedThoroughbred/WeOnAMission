import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui'
import { Users } from 'lucide-react'
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
      const data = await api.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Users" role="superadmin">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">All Users</h1>
        <Card>
          <CardHeader><CardTitle>{users.length} Users</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No users yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border p-4 rounded-lg flex justify-between">
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
