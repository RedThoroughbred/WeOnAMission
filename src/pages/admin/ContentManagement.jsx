import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label, Modal } from '../../components/ui'
import { Plus, Edit, Trash2, FileText, Backpack, Globe, Lightbulb } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { useAuth } from '../../hooks/useAuth'
import { getSupabase } from '../../lib/config'

const SECTIONS = [
  { id: 'faqs', name: 'FAQs', icon: FileText, color: 'blue' },
  { id: 'packing', name: 'Packing Lists', icon: Backpack, color: 'green' },
  { id: 'phrases', name: 'Spanish Phrases', icon: Globe, color: 'purple' },
  { id: 'tips', name: 'Prep Tips', icon: Lightbulb, color: 'amber' },
]

export default function ContentManagement() {
  const { churchId, church } = useTenant()
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('faqs')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    translation: ''
  })

  useEffect(() => {
    if (churchId && activeSection) {
      loadSectionItems()
    }
  }, [churchId, activeSection])

  const loadSectionItems = async () => {
    setLoading(true)
    try {
      console.log(`📝 Loading ${activeSection} for church:`, churchId)
      const sb = getSupabase()

      const { data, error } = await sb
        .from('content_items')
        .select('*')
        .eq('church_id', churchId)
        .eq('section', activeSection)
        .order('order_index')

      if (error) throw error

      setItems(data || [])
      console.log(`✅ Loaded ${data?.length || 0} items`)
    } catch (error) {
      console.error('❌ Error loading content:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      content: '',
      translation: ''
    })
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)

    // For Spanish phrases, parse translation and pronunciation from content
    let translation = ''
    let content = item.content || ''

    if (activeSection === 'phrases' && item.content) {
      const parts = item.content.split('\nPronunciation: ')
      translation = parts[0] || ''
      content = parts[1] || ''
    }

    setFormData({
      title: item.title || '',
      content: content,
      translation: translation
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      const sb = getSupabase()

      // For Spanish phrases, combine translation and pronunciation into content
      let contentValue = formData.content
      if (activeSection === 'phrases' && formData.translation) {
        contentValue = formData.translation + (formData.content ? `\nPronunciation: ${formData.content}` : '')
      }

      if (editingItem) {
        // Update existing item
        const { error } = await sb
          .from('content_items')
          .update({
            title: formData.title,
            content: contentValue
          })
          .eq('id', editingItem.id)
          .eq('church_id', churchId)

        if (error) throw error
        alert('Item updated successfully!')
      } else {
        // Create new item
        const { error } = await sb
          .from('content_items')
          .insert({
            church_id: churchId,
            section: activeSection,
            title: formData.title,
            content: contentValue,
            order_index: items.length,
            created_by: user?.id
          })

        if (error) throw error
        alert('Item created successfully!')
      }

      setShowModal(false)
      await loadSectionItems()
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Failed to save item: ' + error.message)
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const sb = getSupabase()
      const { error } = await sb
        .from('content_items')
        .delete()
        .eq('id', itemId)
        .eq('church_id', churchId)

      if (error) throw error

      alert('Item deleted successfully!')
      await loadSectionItems()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Failed to delete item: ' + error.message)
    }
  }

  const currentSection = SECTIONS.find(s => s.id === activeSection)
  const Icon = currentSection?.icon || FileText

  return (
    <PortalLayout title="Content Management" role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
            Content Management
          </h1>
          {church && (
            <p className="text-gray-600 dark:text-gray-400">
              Managing content for {church.name}
            </p>
          )}
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {SECTIONS.map((section) => {
            const SectionIcon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <SectionIcon className="w-5 h-5" />
                {section.name}
              </button>
            )
          })}
        </div>

        {/* Content Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-6 h-6" />
                {currentSection?.name}
              </CardTitle>
              <Button size="lg" onClick={handleAdd}>
                <Plus className="w-5 h-5 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading content...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No {currentSection?.name.toLowerCase()} yet
                </p>
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            #{index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                        </div>
                        {item.content && activeSection === 'phrases' ? (
                          <>
                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                              {item.content.split('\nPronunciation: ')[0]}
                            </p>
                            {item.content.includes('\nPronunciation: ') && (
                              <p className="text-gray-500 dark:text-gray-500 text-sm italic mt-1">
                                {item.content.split('\nPronunciation: ')[1]}
                              </p>
                            )}
                          </>
                        ) : item.content ? (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {item.content}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
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

        {/* Info Card */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  About {currentSection?.name}
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  {activeSection === 'faqs' && 'Manage frequently asked questions that students and parents can view.'}
                  {activeSection === 'packing' && 'Create and manage packing list items for the mission trip.'}
                  {activeSection === 'phrases' && 'Add helpful Spanish phrases with translations for students.'}
                  {activeSection === 'tips' && 'Share preparation tips to help students get ready for the trip.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? 'Edit Item' : 'Add New Item'}
          size="lg"
        >
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">
                  {activeSection === 'phrases' ? 'Phrase' : 'Title'} *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    activeSection === 'phrases' ? 'Hello'
                      : activeSection === 'packing' ? 'Sunscreen'
                        : activeSection === 'tips' ? 'Pack Light'
                          : 'Question or title'
                  }
                />
              </div>

              {activeSection === 'phrases' && (
                <div>
                  <Label htmlFor="translation">Translation *</Label>
                  <Input
                    id="translation"
                    value={formData.translation}
                    onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                    placeholder="Hola"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">
                  {activeSection === 'faqs' ? 'Answer'
                    : activeSection === 'phrases' ? 'Pronunciation (optional)'
                      : 'Description (optional)'}
                </Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={
                    activeSection === 'faqs' ? 'The answer to this question...'
                      : activeSection === 'phrases' ? 'OH-lah'
                        : activeSection === 'packing' ? 'SPF 50+ recommended'
                          : 'Additional details...'
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} className="flex-1">
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </PortalLayout>
  )
}
