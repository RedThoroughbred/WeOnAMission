import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Modal, ModalContent, ModalFooter } from '../../components/ui'
import { FileText, Plus, Edit, Trash2, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'

const RESOURCE_TYPES = [
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Video' },
  { value: 'website', label: 'Website' },
  { value: 'form', label: 'Form' },
  { value: 'guide', label: 'Guide' },
  { value: 'other', label: 'Other' },
]

const RESOURCE_TYPE_COLORS = {
  document: 'blue',
  video: 'purple',
  website: 'green',
  form: 'amber',
  guide: 'pink',
  other: 'gray',
}

export default function AdminResources() {
  const { churchId, church } = useTenant()
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    resource_type: 'document',
  })

  useEffect(() => {
    if (churchId) {
      loadResources()
    }
  }, [churchId])

  const loadResources = async () => {
    setLoading(true)
    try {
      const data = await api.getResources(churchId)
      setResources(data)
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingResource(null)
    setFormData({
      name: '',
      description: '',
      url: '',
      resource_type: 'document',
    })
    setShowModal(true)
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      name: resource.name || '',
      description: resource.description || '',
      url: resource.url || '',
      resource_type: resource.resource_type || 'document',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      alert('Please fill in resource name and URL')
      return
    }

    try {
      if (editingResource) {
        await api.updateResource(editingResource.id, formData, churchId)
        alert('Resource updated!')
      } else {
        await api.createResource(
          formData.name,
          formData.description,
          formData.url,
          formData.resource_type,
          churchId
        )
        alert('Resource created!')
      }
      setShowModal(false)
      await loadResources()
    } catch (error) {
      console.error('Error saving resource:', error)
      alert('Failed to save resource: ' + error.message)
    }
  }

  const handleDelete = async (resource) => {
    if (!confirm(`Delete resource "${resource.name}"? This cannot be undone.`)) return

    try {
      await api.deleteResource(resource.id, churchId)
      alert('Resource deleted!')
      await loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource: ' + error.message)
    }
  }

  const getTypeColor = (type) => {
    return RESOURCE_TYPE_COLORS[type] || 'gray'
  }

  return (
    <PortalLayout title="Resource Management" role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Resources</h1>
            {church && <p className="text-gray-600 dark:text-gray-400">Managing resources for {church.name}</p>}
          </div>
          <Button onClick={handleAdd} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Resource
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{resources.length} Resource{resources.length !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resources...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No resources yet</p>
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Resource
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {resource.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded bg-${getTypeColor(resource.resource_type)}-100 text-${getTypeColor(resource.resource_type)}-800 dark:bg-${getTypeColor(resource.resource_type)}-900 dark:text-${getTypeColor(resource.resource_type)}-200`}>
                            {RESOURCE_TYPES.find(t => t.value === resource.resource_type)?.label || resource.resource_type}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{resource.description}</p>
                        )}
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Access Resource
                        </a>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(resource)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resource)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
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

        {/* Add/Edit Resource Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingResource ? 'Edit Resource' : 'Add New Resource'}
          size="lg"
        >
          <ModalContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Resource Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Travel Documents Guide"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed information about required travel documents..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="url">URL *</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/document.pdf"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="resource_type">Resource Type</Label>
                <select
                  id="resource_type"
                  value={formData.resource_type}
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {RESOURCE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button onClick={handleSave}>
              {editingResource ? 'Save Changes' : 'Create Resource'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </PortalLayout>
  )
}
