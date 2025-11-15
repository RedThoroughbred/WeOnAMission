import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Badge } from '../../components/ui'
import Modal, { ModalContent, ModalFooter } from '../../components/ui/Modal'
import { UserCog, Users, Phone, Mail, Shield, Plus, X } from 'lucide-react'
import { api } from '../../services/api'
import { useTenant } from '../../hooks/useTenant'

export default function AdminParents() {
  const { churchId } = useTenant()
  const [parents, setParents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [parentStudents, setParentStudents] = useState({}) // Map of parentId -> students[]
  const [loading, setLoading] = useState(true)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [addStudentForm, setAddStudentForm] = useState({
    student_id: '',
    relationship: '',
    is_primary: false
  })

  useEffect(() => {
    if (churchId) {
      loadParents()
      loadAllStudents()
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

  const loadAllStudents = async () => {
    try {
      const data = await api.getStudentsByChurch(churchId)
      setAllStudents(data)
    } catch (error) {
      console.error('❌ Error loading students:', error)
    }
  }

  const handleViewParent = (parent) => {
    setSelectedParent(parent)
    setShowDetailModal(true)
  }

  const handleAddStudent = () => {
    setAddStudentForm({
      student_id: allStudents.length > 0 ? allStudents[0].id : '',
      relationship: '',
      is_primary: false
    })
    setShowAddStudentModal(true)
  }

  const handleSaveAddStudent = async () => {
    if (!addStudentForm.student_id) {
      alert('Please select a student')
      return
    }

    try {
      await api.addParentStudent({
        parent_id: selectedParent.id,
        student_id: addStudentForm.student_id,
        relationship: addStudentForm.relationship || null,
        is_primary: addStudentForm.is_primary
      })
      setShowAddStudentModal(false)
      await loadParents()
      // Refresh the selected parent's students
      const updatedStudents = await api.getParentStudents(selectedParent.id)
      setParentStudents(prev => ({ ...prev, [selectedParent.id]: updatedStudents }))
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student: ' + error.message)
    }
  }

  const handleRemoveStudent = async (parentStudentId) => {
    if (!confirm('Remove this student from this parent?')) return

    try {
      await api.removeParentStudent(parentStudentId)
      await loadParents()
      // Refresh the selected parent's students
      const updatedStudents = await api.getParentStudents(selectedParent.id)
      setParentStudents(prev => ({ ...prev, [selectedParent.id]: updatedStudents }))
    } catch (error) {
      console.error('Error removing student:', error)
      alert('Failed to remove student: ' + error.message)
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
                      <div
                        key={parent.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleViewParent(parent)}
                      >
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
                          <tr
                            key={parent.id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => handleViewParent(parent)}
                          >
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

        {/* Parent Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedParent(null)
          }}
          title={selectedParent?.full_name || 'Parent Details'}
          size="lg"
        >
          <ModalContent>
            {selectedParent && (
              <div className="space-y-6">
                {/* Parent Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Contact Information</h3>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>{' '}
                      <span className="text-gray-900 dark:text-white font-medium">{selectedParent.email}</span>
                    </div>
                    {selectedParent.phone && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Phone:</span>{' '}
                        <span className="text-gray-900 dark:text-white font-medium">{selectedParent.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Students */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Students ({parentStudents[selectedParent.id]?.length || 0})
                    </h3>
                    <Button onClick={handleAddStudent} size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Student
                    </Button>
                  </div>

                  {parentStudents[selectedParent.id] && parentStudents[selectedParent.id].length > 0 ? (
                    <div className="space-y-2">
                      {parentStudents[selectedParent.id].map((ps) => (
                        <div key={ps.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{ps.students.full_name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {ps.students.grade && `Grade ${ps.students.grade}`}
                              {ps.relationship && (
                                <Badge variant="outline" className="ml-2">{ps.relationship}</Badge>
                              )}
                              {ps.is_primary && (
                                <Badge variant="success" className="ml-2">Primary Contact</Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStudent(ps.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No students associated yet</p>
                  )}
                </div>
              </div>
            )}
          </ModalContent>
          <ModalFooter>
            <Button onClick={() => setShowDetailModal(false)}>Close</Button>
          </ModalFooter>
        </Modal>

        {/* Add Student Modal */}
        <Modal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
          title="Add Student to Parent"
          size="md"
        >
          <ModalContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student_select">Student *</Label>
                <select
                  id="student_select"
                  value={addStudentForm.student_id}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select a student</option>
                  {allStudents
                    .filter(s => !parentStudents[selectedParent?.id]?.some(ps => ps.student_id === s.id))
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name} {student.grade && `(Grade ${student.grade})`}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  value={addStudentForm.relationship}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, relationship: e.target.value })}
                  placeholder="e.g., Mother, Father, Guardian"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={addStudentForm.is_primary}
                  onChange={(e) => setAddStudentForm({ ...addStudentForm, is_primary: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_primary" className="mb-0">Primary Contact</Label>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setShowAddStudentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddStudent}>
              Add Student
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </PortalLayout>
  )
}
