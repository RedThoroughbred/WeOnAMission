import React, { useState, useEffect } from 'react'
import PortalLayout from '../../components/layout/PortalLayout'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui'
import { MessageSquare, CheckCircle, Star, Send } from 'lucide-react'
import { useTenant } from '../../hooks/useTenant'
import { api } from '../../services/api'

export default function AdminQuestions() {
  const { churchId, church } = useTenant()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'submitted', 'complete'
  const [respondingTo, setRespondingTo] = useState(null)
  const [responseText, setResponseText] = useState('')
  const [markAsFaq, setMarkAsFaq] = useState(false)
  const [faqCategory, setFaqCategory] = useState('General')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (churchId) {
      loadQuestions()
    }
  }, [churchId, filter])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const status = filter === 'all' ? null : filter
      const data = await api.getQuestions(churchId, status)
      setQuestions(data)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (e) => {
    e.preventDefault()
    if (!responseText.trim() || !respondingTo) return

    setSubmitting(true)
    try {
      await api.respondToQuestion(respondingTo.id, responseText, markAsFaq, churchId)

      // If marked as FAQ, convert to FAQ
      if (markAsFaq) {
        await api.convertToFaq(respondingTo.id, faqCategory, churchId)
      }

      alert('Response sent successfully!' + (markAsFaq ? ' Added to FAQs.' : ''))
      setRespondingTo(null)
      setResponseText('')
      setMarkAsFaq(false)
      setFaqCategory('General')
      await loadQuestions()
    } catch (error) {
      console.error('Error responding to question:', error)
      alert('Failed to respond: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConvertToFaq = async (questionId) => {
    const category = prompt('Enter FAQ category:', 'General')
    if (!category) return

    try {
      await api.convertToFaq(questionId, category, churchId)
      alert('Question converted to FAQ successfully!')
      await loadQuestions()
    } catch (error) {
      console.error('Error converting to FAQ:', error)
      alert('Failed to convert to FAQ: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'complete':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const filteredQuestions = questions

  return (
    <PortalLayout title="User Questions" role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Respond to questions from users
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { value: 'all', label: 'All Questions' },
            { value: 'submitted', label: 'Pending Response' },
            { value: 'complete', label: 'Answered' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                filter === tab.value
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Questions Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'submitted' && 'All questions have been answered!'}
                {filter === 'complete' && 'No answered questions yet.'}
                {filter === 'all' && 'No questions have been submitted yet.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => {
              const hasResponse = question.question_responses && question.question_responses.length > 0
              const response = hasResponse ? question.question_responses[0] : null

              return (
                <Card key={question.id}>
                  <CardContent className="p-6">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(question.status)}`}>
                            {question.status}
                          </span>
                          {response?.is_faq && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              FAQ
                            </span>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {question.question_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          From: <span className="font-medium">{question.users?.full_name || 'Unknown User'}</span>
                          {' '}({question.email})
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(question.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {question.question}
                      </p>
                    </div>

                    {/* Existing Response */}
                    {hasResponse && (
                      <div className="border-l-4 border-primary-500 pl-4 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Response by <span className="font-medium">{response.users?.full_name || 'Admin'}</span>
                          {' '}on {new Date(response.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                          {response.response}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!hasResponse && (
                        <Button
                          onClick={() => setRespondingTo(question)}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Respond
                        </Button>
                      )}
                      {hasResponse && !response.is_faq && (
                        <Button
                          onClick={() => handleConvertToFaq(question.id)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Convert to FAQ
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Response Modal */}
        {respondingTo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Respond to Question</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Original Question */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Question from {respondingTo.users?.full_name}:
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {respondingTo.question}
                  </p>
                </div>

                {/* Response Form */}
                <form onSubmit={handleRespond} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Response
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      rows={6}
                      placeholder="Type your response..."
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="markAsFaq"
                      checked={markAsFaq}
                      onChange={(e) => setMarkAsFaq(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="markAsFaq" className="text-sm text-gray-700 dark:text-gray-300">
                      Add this to FAQs
                    </label>
                  </div>

                  {markAsFaq && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        FAQ Category
                      </label>
                      <input
                        type="text"
                        value={faqCategory}
                        onChange={(e) => setFaqCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Travel, Payments, Health"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button type="submit" disabled={submitting || !responseText.trim()}>
                      {submitting ? 'Sending...' : 'Send Response'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRespondingTo(null)
                        setResponseText('')
                        setMarkAsFaq(false)
                        setFaqCategory('General')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PortalLayout>
  )
}
