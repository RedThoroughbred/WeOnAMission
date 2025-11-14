import React, { useState, useEffect, useRef } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Label, Skeleton } from '../../components/ui'
import Modal, { ModalContent, ModalFooter } from '../../components/ui/Modal'
import { FileText, Upload, Download, Trash2, CheckCircle, XCircle, Clock, File } from 'lucide-react'
import { formatDate, formatFileSize } from '../../lib/utils'

export default function Documents() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState([])
  const [documents, setDocuments] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [documentType, setDocumentType] = useState('medical_form')
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 800))

      const mockStudents = [
        { id: 1, full_name: 'John Doe' },
        { id: 2, full_name: 'Jane Doe' }
      ]

      const mockDocuments = [
        {
          id: 1,
          student_id: 1,
          student_name: 'John Doe',
          file_name: 'Medical_Form_John.pdf',
          file_type: 'application/pdf',
          file_size: 245760,
          document_type: 'medical_form',
          status: 'approved',
          uploaded_at: '2025-11-01',
          reviewed_at: '2025-11-02'
        },
        {
          id: 2,
          student_id: 1,
          student_name: 'John Doe',
          file_name: 'Permission_Slip_John.pdf',
          file_type: 'application/pdf',
          file_size: 189440,
          document_type: 'permission_slip',
          status: 'pending',
          uploaded_at: '2025-11-10'
        },
        {
          id: 3,
          student_id: 2,
          student_name: 'Jane Doe',
          file_name: 'Medical_Form_Jane.pdf',
          file_type: 'application/pdf',
          file_size: 256000,
          document_type: 'medical_form',
          status: 'rejected',
          uploaded_at: '2025-11-05',
          reviewed_at: '2025-11-06',
          rejection_reason: 'Missing signature on page 2'
        }
      ]

      setStudents(mockStudents)
      setDocuments(mockDocuments)
      if (mockStudents.length > 0) {
        setSelectedStudent(mockStudents[0])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0])
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile || !selectedStudent) return

    try {
      // TODO: Replace with actual API call
      const newDocument = {
        id: Date.now(),
        student_id: selectedStudent.id,
        student_name: selectedStudent.full_name,
        file_name: uploadFile.name,
        file_type: uploadFile.type,
        file_size: uploadFile.size,
        document_type: documentType,
        status: 'pending',
        uploaded_at: new Date().toISOString().split('T')[0]
      }

      setDocuments([newDocument, ...documents])
      setShowUploadModal(false)
      setUploadFile(null)
      setDocumentType('medical_form')
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  const handleDelete = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // TODO: Replace with actual API call
      setDocuments(documents.filter(d => d.id !== docId))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const openUploadModal = () => {
    setUploadFile(null)
    setDocumentType('medical_form')
    setShowUploadModal(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-amber-600" />
    }
  }

  const filteredDocuments = documents.filter(
    d => !selectedStudent || d.student_id === selectedStudent.id
  )

  const getDocumentStats = () => {
    const stats = {
      total: documents.length,
      approved: documents.filter(d => d.status === 'approved').length,
      pending: documents.filter(d => d.status === 'pending').length,
      rejected: documents.filter(d => d.status === 'rejected').length
    }
    return stats
  }

  const stats = getDocumentStats()

  if (loading) {
    return (
      <PortalLayout title="Documents" role="parent">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout title="Documents" role="parent">
      <div className="space-y-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Document Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Upload and track required trip documents</p>
          </div>
          <Button onClick={openUploadModal} disabled={!selectedStudent}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Tabs */}
        {students.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {students.map((student) => (
              <Button
                key={student.id}
                variant={selectedStudent?.id === student.id ? 'primary' : 'outline'}
                onClick={() => setSelectedStudent(student)}
              >
                {student.full_name}
              </Button>
            ))}
          </div>
        )}

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStudent ? `Documents for ${selectedStudent.full_name}` : 'All Documents'}
            </CardTitle>
            <CardDescription>
              Uploaded documents and their approval status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No documents uploaded
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Upload your first document to get started
                </p>
                <Button onClick={openUploadModal}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                        <File className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {doc.file_name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span>{doc.document_type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploaded_at)}</span>
                        </div>
                        {doc.status === 'rejected' && doc.rejection_reason && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Reason: {doc.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {getStatusIcon(doc.status)}
                      <Badge
                        variant={
                          doc.status === 'approved' ? 'success' :
                          doc.status === 'rejected' ? 'error' : 'warning'
                        }
                      >
                        {doc.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleDelete(doc.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload Document"
          size="md"
        >
          <form onSubmit={handleUpload}>
            <ModalContent>
              <div className="space-y-4">
                <div>
                  <Label>Student</Label>
                  <div className="mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedStudent?.full_name}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="document_type" required>Document Type</Label>
                  <select
                    id="document_type"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="medical_form">Medical Form</option>
                    <option value="permission_slip">Permission Slip</option>
                    <option value="passport">Passport Copy</option>
                    <option value="insurance">Insurance Card</option>
                    <option value="emergency_contact">Emergency Contact</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Drag and Drop Zone */}
                <div>
                  <Label required>File</Label>
                  <div
                    className={`mt-1 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploadFile ? (
                      <div className="space-y-2">
                        <File className="w-12 h-12 mx-auto text-primary-600" />
                        <p className="font-medium text-gray-900 dark:text-white">
                          {uploadFile.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(uploadFile.size)}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-900 dark:text-white font-medium mb-1">
                          Drop your file here, or{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary-600 hover:underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </div>
              </div>
            </ModalContent>

            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!uploadFile}>
                Upload Document
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}
