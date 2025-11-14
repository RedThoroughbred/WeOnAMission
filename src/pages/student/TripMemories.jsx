import React, { useState, useEffect, useRef } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Input, Label, Textarea, Skeleton } from '../../components/ui'
import Modal, { ModalContent, ModalFooter } from '../../components/ui/Modal'
import { Image, Upload, Plus, Heart, Clock, CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '../../lib/utils'

export default function TripMemories() {
  const [loading, setLoading] = useState(true)
  const [memories, setMemories] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadFile, setUploadFile] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  })
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      setMemories([
        {
          id: 1,
          title: 'Helping at the School',
          content: 'Today we helped paint classrooms and play with the kids. It was amazing to see their smiles!',
          photo_url: null,
          status: 'approved',
          submitted_at: '2025-11-20',
          approved_at: '2025-11-21'
        },
        {
          id: 2,
          title: 'Village Tour',
          content: 'We toured the village and met so many wonderful people. The culture here is beautiful.',
          photo_url: null,
          status: 'pending',
          submitted_at: '2025-11-22'
        },
        {
          id: 3,
          title: 'Building Project',
          content: 'Working on the new community center. Hard work but so rewarding!',
          photo_url: null,
          status: 'rejected',
          submitted_at: '2025-11-15',
          rejection_reason: 'Please add more details about the project'
        }
      ])
    } catch (error) {
      console.error('Error loading memories:', error)
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
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setUploadFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const newMemory = {
        id: Date.now(),
        ...formData,
        photo_url: imagePreview,
        status: 'pending',
        submitted_at: new Date().toISOString().split('T')[0]
      }

      setMemories([newMemory, ...memories])
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error('Error submitting memory:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0]
    })
    setUploadFile(null)
    setImagePreview(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
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

  if (loading) {
    return (
      <PortalLayout title="Trip Memories" role="student">
        <div className="space-y-6">
          <Skeleton className="h-12" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </PortalLayout>
    )
  }

  return (
    <PortalLayout title="Trip Memories" role="student">
      <div className="space-y-6 animate-fadeInUp">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Trip Memories</h2>
            <p className="text-gray-600 dark:text-gray-400">Share your experiences and create lasting memories</p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Memory
          </Button>
        </div>

        {/* Memories Grid */}
        {memories.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No memories yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start sharing your mission trip experiences
              </p>
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Memory
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden hover:shadow-xl transition-all">
                {/* Image */}
                {memory.photo_url ? (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={memory.photo_url}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 flex items-center justify-center">
                    <Image className="w-12 h-12 text-purple-400 dark:text-purple-600" />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg">{memory.title}</CardTitle>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {getStatusIcon(memory.status)}
                    </div>
                  </div>
                  <Badge
                    variant={
                      memory.status === 'approved' ? 'success' :
                      memory.status === 'rejected' ? 'error' : 'warning'
                    }
                    className="mb-3"
                  >
                    {memory.status}
                  </Badge>
                  <CardDescription className="line-clamp-3">
                    {memory.content}
                  </CardDescription>
                  {memory.status === 'rejected' && memory.rejection_reason && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      <strong>Reason:</strong> {memory.rejection_reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Submitted {formatDate(memory.submitted_at)}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Add Memory Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Share a Memory"
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <ModalContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" required>Memory Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Helping at the School"
                  />
                </div>

                <div>
                  <Label htmlFor="date" required>Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content" required>Your Story</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    placeholder="Share your experience, what you learned, and how it impacted you..."
                    className="min-h-[150px]"
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <Label>Photo (Optional)</Label>
                  <div
                    className={`mt-1 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadFile(null)
                            setImagePreview(null)
                          }}
                        >
                          Remove Photo
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Image className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-900 dark:text-white font-medium mb-1">
                          Drop your photo here, or{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-purple-600 hover:underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          JPG, PNG, GIF (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </ModalContent>

            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Heart className="w-4 h-4 mr-2" />
                Share Memory
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      </div>
    </PortalLayout>
  )
}
