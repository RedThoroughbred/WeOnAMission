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
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetails, setStudentDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
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

  const handleViewStudent = async (student) => {
    setSelectedStudent(student)
    setShowDetailModal(true)
    setLoadingDetails(true)
    try {
      const details = await api.getStudentDetails(student.id)
      setStudentDetails(details)
    } catch (error) {
      console.error('Error loading student details:', error)
      alert('Failed to load student details')
    } finally {
      setLoadingDetails(false)
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
              <Card
                key={student.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewStudent(student)}
              >
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditStudent(student)
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteStudent(student.id)
                    }}
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

        {/* Student Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedStudent(null)
            setStudentDetails(null)
          }}
          title={selectedStudent?.full_name || 'Student Details'}
          size="xl"
        >
          <ModalContent>
            {loadingDetails ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading details...</p>
              </div>
            ) : studentDetails ? (
              <div className="space-y-6">
                {/* Student Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Student Information</h3>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Grade:</span>{' '}
                      <span className="text-gray-900 dark:text-white font-medium">{studentDetails.grade || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>{' '}
                      <span className="text-gray-900 dark:text-white font-medium">
                        {studentDetails.date_of_birth || 'N/A'}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">Emergency Contact:</span>{' '}
                      <span className="text-gray-900 dark:text-white font-medium">
                        {studentDetails.emergency_contact_name || 'N/A'}
                        {studentDetails.emergency_contact_phone && ` - ${studentDetails.emergency_contact_phone}`}
                      </span>
                    </div>
                    {studentDetails.medical_info && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Medical Info:</span>{' '}
                        <span className="text-gray-900 dark:text-white font-medium">{studentDetails.medical_info}</span>
                      </div>
                    )}
                    {studentDetails.allergies && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Allergies:</span>{' '}
                        <span className="text-gray-900 dark:text-white font-medium">{studentDetails.allergies}</span>
                      </div>
                    )}
                    {studentDetails.dietary_restrictions && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Dietary:</span>{' '}
                        <span className="text-gray-900 dark:text-white font-medium">{studentDetails.dietary_restrictions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Parents */}
                {studentDetails.parents && studentDetails.parents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Parents/Guardians</h3>
                    <div className="space-y-2">
                      {studentDetails.parents.map((parentRel) => (
                        <div key={parentRel.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{parentRel.users.full_name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{parentRel.users.email}</div>
                            {parentRel.users.phone && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">{parentRel.users.phone}</div>
                            )}
                          </div>
                          <div className="text-right">
                            {parentRel.relationship && (
                              <Badge variant="outline" className="mb-1">{parentRel.relationship}</Badge>
                            )}
                            {parentRel.is_primary && (
                              <Badge variant="success">Primary</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payments */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Payment History ({studentDetails.payments?.length || 0})
                  </h3>
                  {studentDetails.payments && studentDetails.payments.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetails.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                          <div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">${payment.amount}</div>
                            <Badge variant={payment.status === 'paid' ? 'success' : 'warning'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No payments recorded yet</p>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                    Documents ({studentDetails.documents?.length || 0})
                  </h3>
                  {studentDetails.documents && studentDetails.documents.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetails.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{doc.title}</div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {new Date(doc.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant={
                            doc.status === 'approved' ? 'success' :
                            doc.status === 'rejected' ? 'destructive' : 'warning'
                          }>
                            {doc.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No documents uploaded yet</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">No details available</p>
            )}
          </ModalContent>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                setShowDetailModal(false)
                handleEditStudent(selectedStudent)
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Student
            </Button>
            <Button onClick={() => setShowDetailModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </PortalLayout>
  )
}
