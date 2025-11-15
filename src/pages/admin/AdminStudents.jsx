import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../../components/ui'
import { Users, Plus, Edit, Trash2, Search } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'

export default function AdminStudents() {
  const navigate = useNavigate()
  const { churchId, church } = useTenant()
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    grade: '',
    medical_info: '',
    emergency_contact: ''
  })

  useEffect(() => {
    if (churchId) {
      loadStudents()
    }
  }, [churchId])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredStudents(
        students.filter(s =>
          s.full_name?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query) ||
          s.grade?.toString().includes(query)
        )
      )
    }
  }, [searchQuery, students])

  const loadStudents = async () => {
    setLoading(true)
    try {
      console.log('📚 Loading students for church:', churchId)
      const data = await api.getAllStudents(churchId)
      setStudents(data)
      setFilteredStudents(data)
      console.log('✅ Loaded', data.length, 'students')
    } catch (error) {
      console.error('❌ Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setEditForm({
      full_name: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      grade: student.grade || '',
      medical_info: student.medical_info || '',
      emergency_contact: student.emergency_contact || ''
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingStudent) return

    try {
      await api.updateStudent(editingStudent.id, editForm, churchId)
      setShowEditModal(false)
      setEditingStudent(null)
      await loadStudents()
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student')
    }
  }

  const handleDelete = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      await api.deleteStudent(studentId, churchId)
      await loadStudents()
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student')
    }
  }

  return (
    <PortalLayout title="Student Management" role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
              Students
            </h1>
            {church && (
              <p className="text-gray-600 dark:text-gray-400">
                Managing students for {church.name}
              </p>
            )}
          </div>
          <Button onClick={() => setShowAddModal(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search students by name, email, or grade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''}
              {searchQuery && ` (filtered from ${students.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No students found matching your search' : 'No students yet'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowAddModal(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Student
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Mobile: Card view */}
                <div className="grid gap-4 sm:hidden">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {student.full_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm mb-3">
                        <p><span className="text-gray-600 dark:text-gray-400">Grade:</span> {student.grade || 'N/A'}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Phone:</span> {student.phone || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(student)}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table view */}
                <table className="hidden sm:table w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Grade</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Phone</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {student.full_name}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {student.email || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {student.grade || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {student.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(student)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(student.id)}
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
            )}
          </CardContent>
        </Card>

        {/* Add Student Modal - Coming soon */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Add Student</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Student creation form coming soon! For now, please use the parent portal to add students.
              </p>
              <Button onClick={() => setShowAddModal(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && editingStudent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 my-8">
              <h2 className="text-2xl font-bold mb-6">Edit Student</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit_full_name">Full Name *</Label>
                  <Input
                    id="edit_full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    placeholder="Student's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="student@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="edit_grade">Grade</Label>
                    <Input
                      id="edit_grade"
                      value={editForm.grade}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      placeholder="9"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit_medical">Medical Information</Label>
                  <Input
                    id="edit_medical"
                    value={editForm.medical_info}
                    onChange={(e) => setEditForm({ ...editForm, medical_info: e.target.value })}
                    placeholder="Allergies, medications, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="edit_emergency">Emergency Contact</Label>
                  <Input
                    id="edit_emergency"
                    value={editForm.emergency_contact}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                    placeholder="Name: John Doe, Phone: (555) 123-4567"
                  />
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
                    setEditingStudent(null)
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
