import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui'
import { UserCog, Users, Phone, Mail, Shield } from 'lucide-react'
import { api } from '../../services/api'
import { useTenant } from '../../hooks/useTenant'

export default function AdminParents() {
  const { churchId } = useTenant()
  const [parents, setParents] = useState([])
  const [parentStudents, setParentStudents] = useState({}) // Map of parentId -> students[]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (churchId) {
      loadParents()
    }
  }, [churchId])

  const loadParents = async () => {
    setLoading(true)
    try {
      console.log('👨‍👩‍👧‍👦 Loading parents for church:', churchId)
      const data = await api.getParentsByChurch(churchId)
      console.log('👨‍👩‍👧‍👦 Loaded parents:', data.length, data)
      setParents(data)

      // Load students for each parent
      const studentMap = {}
      for (const parent of data) {
        try {
          const studentData = await api.getParentStudents(parent.id)
          studentMap[parent.id] = studentData
        } catch (error) {
          console.error(`Error loading students for parent ${parent.id}:`, error)
          studentMap[parent.id] = []
        }
      }
      setParentStudents(studentMap)
    } catch (error) {
      console.error('❌ Error loading parents:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PortalLayout title="Parents" role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
              Parents
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage parents and their student relationships
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{parents.length} Parent{parents.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading parents...</p>
              </div>
            ) : parents.length === 0 ? (
              <div className="text-center py-12">
                <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No parents found</p>
                <p className="text-sm text-gray-500 mt-2">Parents will appear here when users are created with the parent role</p>
              </div>
            ) : (
              <>
                {/* Mobile: Card view */}
                <div className="grid gap-4 sm:hidden">
                  {parents.map((parent) => {
                    const students = parentStudents[parent.id] || []
                    return (
                      <div key={parent.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {parent.full_name || 'N/A'}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {parent.email}
                            </p>
                            {parent.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {parent.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{students.length} Student{students.length !== 1 ? 's' : ''}</span>
                          </div>
                          {students.length > 0 && (
                            <ul className="space-y-1 text-sm">
                              {students.map((ps) => (
                                <li key={ps.id} className="text-gray-700 dark:text-gray-300">
                                  • {ps.students.full_name}
                                  {ps.relationship && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                      ({ps.relationship})
                                    </span>
                                  )}
                                  {ps.is_primary && (
                                    <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                      Primary
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop: Table view */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parents.map((parent) => {
                        const students = parentStudents[parent.id] || []
                        return (
                          <tr key={parent.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {parent.full_name || 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {parent.email}
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {parent.phone || '-'}
                            </td>
                            <td className="py-3 px-4">
                              {students.length === 0 ? (
                                <span className="text-gray-400">No students</span>
                              ) : (
                                <div className="space-y-1">
                                  {students.map((ps) => (
                                    <div key={ps.id} className="text-sm">
                                      <span className="text-gray-900 dark:text-white">
                                        {ps.students.full_name}
                                      </span>
                                      {ps.relationship && (
                                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                                          ({ps.relationship})
                                        </span>
                                      )}
                                      {ps.is_primary && (
                                        <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                          Primary
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  )
}
