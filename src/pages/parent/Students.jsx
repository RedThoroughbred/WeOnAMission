import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Label, Skeleton } from '../../components/ui'
import Modal, { ModalContent, ModalFooter } from '../../components/ui/Modal'
import { Users, Plus, Edit, Trash2, Search, Phone, Mail, AlertCircle } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'

export default function Students() {
  const navigate = useNavigate()
  const { churchId } = useTenant()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    grade: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_info: '',
    allergies: '',
    dietary_restrictions: ''
  })

  useEffect(() => {
    if (churchId && user) {
      loadStudents()
    }
  }, [churchId, user])

  const loadStudents = async () => {
    setLoading(true)
    try {
      console.log('👨‍👩‍👧‍👦 Loading MY students for parent:', user.id)
      const data = await api.getMyStudents(churchId, user.id)
      setStudents(data)
      console.log('✅ Loaded', data.length, 'students')
    } catch (error) {
      console.error('❌ Error loading students:', error)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = () => {
    setEditingStudent(null)
    setFormData({
      full_name: '',
      grade: '',
      date_of_birth: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      medical_info: '',
      allergies: '',
      dietary_restrictions: ''
    })
    setShowAddModal(true)
  }

  const handleEditStudent = (student) => {
    setEditingStudent(student)
    setFormData(student)
    setShowAddModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingStudent) {
        // Update existing student
        await api.updateStudent(editingStudent.id, formData, churchId)
      } else {
        // Add new student
        await api.createStudent(formData, churchId, user.id)
      }
      setShowAddModal(false)
      await loadStudents()
    } catch (error) {
      console.error('Error saving student:', error)
      alert('Failed to save student: ' + error.message)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to remove this student?')) return
    try {
      await api.deleteStudent(studentId, churchId)
      await loadStudents()
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student')
    }
  }

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <PortalLayout title="My Students" role="parent">
        <div className="space-y-6">
          <Skeleton className="h-12" />
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout title="My Students" role="parent">
      <div className="space-y-10 animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
              Students
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Manage students registered for the mission trip</p>
          </div>
          <Button onClick={handleAddStudent} size="lg">
            <Plus className="w-6 h-6 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No students found' : 'No students yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery ? 'Try a different search term' : 'Add your first student to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddStudent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{student.full_name}</CardTitle>
                        <CardDescription>Grade {student.grade}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{student.emergency_contact_phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        {student.allergies && student.allergies !== 'None' && (
                          <p><strong>Allergies:</strong> {student.allergies}</p>
                        )}
                        {student.dietary_restrictions && student.dietary_restrictions !== 'None' && (
                          <p><strong>Diet:</strong> {student.dietary_restrictions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditStudent(student)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={editingStudent ? 'Edit Student' : 'Add Student'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <ModalContent>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="full_name" required>Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade" required>Grade</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="6"
                      max="12"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      required
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth" required>Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Emergency Contact</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="emergency_contact_name" required>Contact Name</Label>
                      <Input
                        id="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                        required
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergency_contact_phone" required>Contact Phone</Label>
                      <Input
                        id="emergency_contact_phone"
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                        required
                        placeholder="555-0123"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Medical Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="medical_info">Medical Conditions</Label>
                      <Input
                        id="medical_info"
                        value={formData.medical_info}
                        onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
                        placeholder="e.g., Asthma, Diabetes (or 'None')"
                      />
                    </div>
                    <div>
                      <Label htmlFor="allergies">Allergies</Label>
                      <Input
                        id="allergies"
                        value={formData.allergies}
                        onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                        placeholder="e.g., Peanuts, Penicillin (or 'None')"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                      <Input
                        id="dietary_restrictions"
                        value={formData.dietary_restrictions}
                        onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                        placeholder="e.g., Vegetarian, Gluten-free (or 'None')"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ModalContent>

            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingStudent ? 'Update Student' : 'Add Student'}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}
