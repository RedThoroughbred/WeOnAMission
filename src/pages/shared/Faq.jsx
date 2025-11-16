import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardContent, Button, Modal, Input, Label } from '../../components/ui'
import { HelpCircle, ChevronDown, ChevronUp, Plus, Edit, Trash2 } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { useAuth } from '../../hooks/useAuth'
import { api } from '../../services/api'

export default function Faq() {
  const location = useLocation()
  const { churchId, church } = useTenant()
  const { userProfile, user } = useAuth()
  const [faqs, setFaqs] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [expandedFaqs, setExpandedFaqs] = useState(new Set())
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General'
  })

  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'superadmin'

  // Determine portal role based on URL path
  const getPortalRole = () => {
    const path = location.pathname
    if (path.startsWith('/super-admin')) return 'superadmin'
    if (path.startsWith('/admin')) return 'admin'
    if (path.startsWith('/student')) return 'student'
    if (path.startsWith('/parent')) return 'parent'
    return userProfile?.role || 'parent'
  }

  useEffect(() => {
    if (churchId) {
      loadFaqs()
      loadCategories()
    }
  }, [churchId])

  const loadFaqs = async () => {
    setLoading(true)
    try {
      const data = await api.getFaqs(churchId)
      setFaqs(data)
    } catch (error) {
      console.error('Error loading FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await api.getFaqCategories(churchId)
      setCategories(['All', ...data])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleAdd = () => {
    setEditingFaq(null)
    setFormData({
      question: '',
      answer: '',
      category: 'General'
    })
    setShowModal(true)
  }

  const handleEdit = (faq) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || 'General'
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in both question and answer')
      return
    }

    try {
      if (editingFaq) {
        await api.updateFaq(editingFaq.id, formData, churchId)
        alert('FAQ updated successfully!')
      } else {
        await api.createFaq(
          formData.question,
          formData.answer,
          formData.category,
          churchId
        )
        alert('FAQ created successfully!')
      }

      setShowModal(false)
      await loadFaqs()
      await loadCategories()
    } catch (error) {
      console.error('Error saving FAQ:', error)
      alert('Failed to save FAQ: ' + error.message)
    }
  }

  const handleDelete = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return

    try {
      await api.deleteFaq(faqId, churchId)
      alert('FAQ deleted successfully!')
      await loadFaqs()
      await loadCategories()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('Failed to delete FAQ: ' + error.message)
    }
  }

  const toggleFaq = (faqId) => {
    const newExpanded = new Set(expandedFaqs)
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId)
    } else {
      newExpanded.add(faqId)
    }
    setExpandedFaqs(newExpanded)
  }

  const filteredFaqs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory)

  // Group FAQs by category for display
  const faqsByCategory = filteredFaqs.reduce((acc, faq) => {
    const cat = faq.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(faq)
    return acc
  }, {})

  return (
    <PortalLayout title="FAQ" role={getPortalRole()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find answers to common questions{church ? ` about ${church.name}` : ''}
              </p>
            </div>
          </div>

          {isAdmin && (
            <Button onClick={handleAdd} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add FAQ
            </Button>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* FAQs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading FAQs...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No FAQs Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedCategory === 'All'
                  ? 'No frequently asked questions have been added yet.'
                  : `No FAQs in the "${selectedCategory}" category.`}
              </p>
              {isAdmin && (
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First FAQ
                </Button>
              )}
            </CardContent>
          </Card>
        ) : selectedCategory === 'All' ? (
          // Show FAQs grouped by category
          <div className="space-y-6">
            {Object.entries(faqsByCategory).map(([category, categoryFaqs]) => (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary-600 rounded-full"></span>
                  {category}
                </h2>
                <div className="space-y-3">
                  {categoryFaqs.map((faq) => (
                    <Card key={faq.id} className="overflow-hidden">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(faq)
                                }}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(faq.id)
                                }}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                              </button>
                            </>
                          )}
                          {expandedFaqs.has(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {expandedFaqs.has(faq.id) && (
                        <div className="px-6 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show FAQs in selected category
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <HelpCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(faq)
                          }}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(faq.id)
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </>
                    )}
                    {expandedFaqs.has(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedFaqs.has(faq.id) && (
                  <div className="px-6 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isAdmin && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
            size="lg"
          >
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="question">Question *</Label>
                  <Input
                    id="question"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="What is the cost of the trip?"
                  />
                </div>

                <div>
                  <Label htmlFor="answer">Answer *</Label>
                  <textarea
                    id="answer"
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="The total cost of the trip is..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="General"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Suggested categories: General, Travel, Costs, Packing, Safety, etc.
                  </p>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSave} className="flex-1">
                    {editingFaq ? 'Save Changes' : 'Create FAQ'}
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
        )}
      </div>
    </PortalLayout>
  )
}
