import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Label, Skeleton } from '../../components/ui'
import Modal, { ModalContent, ModalFooter } from '../../components/ui/Modal'
import { Users, Plus, Edit, Trash2, Search, Phone, Mail, AlertCircle } from 'lucide-react'

export default function Students() {
  const navigate = useNavigate()
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
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setStudents([
        {
          id: 1,
          full_name: 'John Doe',
          grade: 10,
          date_of_birth: '2009-05-15',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '555-0123',
          medical_info: 'None',
          allergies: 'Peanuts',
          dietary_restrictions: 'None'
        },
        {
          id: 2,
          full_name: 'Jane Doe',
          grade: 12,
          date_of_birth: '2007-08-20',
          emergency_contact_name: 'John Doe Sr.',
          emergency_contact_phone: '555-0124',
          medical_info: 'Asthma - carries inhaler',
          allergies: 'None',
          dietary_restrictions: 'Vegetarian'
        }
      ])
    } catch (error) {
      console.error('Error loading students:', error)
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
      // TODO: Replace with actual API call
      if (editingStudent) {
        // Update existing student
        setStudents(students.map(s => s.id === editingStudent.id ? { ...formData, id: s.id } : s))
      } else {
        // Add new student
        setStudents([...students, { ...formData, id: Date.now() }])
      }
      setShowAddModal(false)
    } catch (error) {
      console.error('Error saving student:', error)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to remove this student?')) return
    try {
      // TODO: Replace with actual API call
      setStudents(students.filter(s => s.id !== studentId))
    } catch (error) {
      console.error('Error deleting student:', error)
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
      <div className="space-y-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Students</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Manage students registered for the mission trip</p>
          </div>
          <Button onClick={handleAddStudent} size="md" className="shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
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
